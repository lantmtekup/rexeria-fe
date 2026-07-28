import 'server-only';

import {
  type PutObjectCommandInput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import path from 'path';

import { HttpException } from '@/server/errors';
import { ErrorCode, HttpStatus } from '@/settings/enums';
import { isMisleadingLocalImageBase } from '@/lib/upload/public-image-base';
import { confirmS3TmpFiles } from '@/lib/upload/s3-confirm';
import { UPLOAD_CONSTANTS } from '@/lib/upload/constants';
import type { UploadApiData } from '@/types/api';

const DEFAULT_ALLOWED_EXT = 'jpg|jpeg|png|webp|pdf';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

const nanoidLike = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLNMOPQSTUVXYZ0123456789';
  const out: string[] = [];
  const buf = new Uint8Array(5);
  crypto.getRandomValues(buf);
  for (let i = 0; i < 5; i += 1) out.push(chars[buf[i]! % chars.length]!);
  return out.join('');
};

const toSlug = (name: string): string => {
  const base = path.parse(name).name;
  const slug = base
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'file';
};

const getAllowedExtPattern = (): string => {
  const raw = process.env.UPLOAD_FILE_EXT?.trim();
  if (!raw) return DEFAULT_ALLOWED_EXT;
  return raw.replace(/,/g, '|');
};

const isExtAllowed = (fileName: string, pattern: string): boolean => {
  const ext = path.extname(fileName).replace(/^\./, '').toLowerCase();
  if (!ext) return false;
  const regex = new RegExp(`\\.(${pattern})$`, 'i');
  return regex.test(fileName);
};

// Content-Type suy DUY NHẤT từ đuôi file đã qua allow-list — không tin
// `file.type` (attacker kiểm soát được → stored HTML/XSS trên asset domain).
// Đuôi ngoài map (mở rộng qua UPLOAD_FILE_EXT) → octet-stream (browser tải
// về thay vì render).
const resolveContentType = (fileName: string): string => {
  const ext = path.extname(fileName).toLowerCase();
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
};

const isS3Configured = (): boolean =>
  process.env.STORAGE_SERVER === 's3' &&
  Boolean(process.env.S3_ACCESS_KEY_ID?.trim()) &&
  Boolean(process.env.S3_ACCESS_KEY_SECRET?.trim()) &&
  Boolean(process.env.S3_REGION?.trim()) &&
  Boolean(process.env.S3_BUCKET_NAME?.trim());

const isAclEnabled = (): boolean =>
  process.env.S3_USE_ACL?.trim().toLowerCase() !== 'false';

const encodeS3KeySegments = (key: string): string =>
  key
    .split('/')
    .filter(s => s.length > 0)
    .map(seg => encodeURIComponent(seg))
    .join('/');

const buildS3VirtualHostedUrl = (
  bucket: string,
  region: string,
  key: string
): string => {
  const normalizedKey = key.replace(/^\//, '');
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  return `https://${host}/${encodeS3KeySegments(normalizedKey)}`;
};

const buildPublicUrlsForKeys = (
  keys: string[],
  bucket: string,
  region: string
): string[] => {
  const domainImage = process.env.NEXT_PUBLIC_DOMAIN_IMAGE?.trim();
  const publicBase = process.env.S3_PUBLIC_URL_BASE?.trim();
  const safeDomain =
    domainImage && !isMisleadingLocalImageBase(domainImage)
      ? domainImage
      : undefined;
  const safePublicBase =
    publicBase && !isMisleadingLocalImageBase(publicBase)
      ? publicBase
      : undefined;

  return keys.map(k => {
    const normalizedKey = k.replace(/^\//, '');
    if (safeDomain) {
      const prefix = safeDomain.replace(/\/$/, '');
      return `${prefix}/${normalizedKey}`;
    }
    if (safePublicBase) {
      const prefix = safePublicBase.replace(/\/$/, '');
      return `${prefix}/${normalizedKey}`;
    }
    return buildS3VirtualHostedUrl(bucket, region, normalizedKey);
  });
};

const sendPutObject = async (
  client: S3Client,
  input: PutObjectCommandInput,
  useAcl: boolean
): Promise<void> => {
  if (!useAcl) {
    await client.send(new PutObjectCommand(input));
    return;
  }
  try {
    await client.send(new PutObjectCommand({ ...input, ACL: 'public-read' }));
  } catch (e: unknown) {
    const err = e as { name?: string; Code?: string };
    if (
      err?.name === 'AccessControlListNotSupported' ||
      err?.Code === 'AccessControlListNotSupported'
    ) {
      await client.send(new PutObjectCommand(input));
      return;
    }
    throw e;
  }
};

const collectFiles = (formData: FormData): File[] => {
  const files = formData
    .getAll('files')
    .filter((v): v is File => v instanceof File && v.size > 0);
  const single = formData.get('file');
  if (single instanceof File && single.size > 0) files.push(single);
  return files;
};

export const uploadService = {
  // Authorization xảy ra ở upload.controller (session cookie hoặc
  // x-upload-secret) — service chỉ xử lý multipart + S3.
  async processMultipartUpload(request: Request): Promise<UploadApiData> {
    if (!isS3Configured()) {
      throw HttpException.fail(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.UPLOAD_S3_NOT_CONFIGURED,
        { logMessage: 'S3 env not configured' }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw HttpException.badRequest(ErrorCode.UPLOAD_MULTIPART_INVALID);
    }

    const uploads = collectFiles(formData);
    if (uploads.length === 0) {
      throw HttpException.badRequest(ErrorCode.UPLOAD_NO_FILES);
    }

    const extPattern = getAllowedExtPattern();
    for (const file of uploads) {
      if (file.size > UPLOAD_CONSTANTS.MAX_FILE_BYTES) {
        throw HttpException.badRequest(ErrorCode.UPLOAD_FILE_TOO_LARGE, {
          details: { maxMb: UPLOAD_CONSTANTS.MAX_FILE_MB },
        });
      }
      if (!isExtAllowed(file.name, extPattern)) {
        throw HttpException.badRequest(ErrorCode.UPLOAD_FILE_TYPE_NOT_ALLOWED, {
          details: { fileName: file.name },
        });
      }
    }

    const bucketPath = (process.env.S3_BUCKET_NAME_PATH ?? '').replace(
      /^\/+|\/+$/g,
      ''
    );
    const prefix = path.posix.join(bucketPath, 'upload', 'tmp');

    const client = new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_ACCESS_KEY_SECRET!,
      },
    });

    const bucket = process.env.S3_BUCKET_NAME!;
    const region = process.env.S3_REGION!;
    const useAcl = isAclEnabled();
    const tmpKeys: string[] = [];
    const tmpBasenames: string[] = [];

    try {
      for (const file of uploads) {
        const ext = path.extname(file.name);
        const objectName = `${toSlug(file.name)}_${Date.now()}_${nanoidLike()}${ext}`;
        const key = path.posix.join(prefix, objectName);

        const body = Buffer.from(await file.arrayBuffer());
        await sendPutObject(
          client,
          {
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: resolveContentType(file.name),
          },
          useAcl
        );
        tmpKeys.push(key);
        tmpBasenames.push(objectName);
      }
    } catch (err) {
      const logMessage =
        err instanceof Error ? err.message : 'S3 upload failed';
      throw HttpException.badGateway(ErrorCode.UPLOAD_S3_PUT_FAILED, {
        logMessage,
      });
    }

    const skipConfirm =
      process.env.UPLOAD_SKIP_CONFIRM?.trim().toLowerCase() === 'true';
    let outPaths = tmpKeys;
    let confirmed = false;

    if (!skipConfirm) {
      try {
        outPaths = await confirmS3TmpFiles({
          client,
          bucket,
          bucketPath,
          tmpBasenames,
          useAclPublicRead: useAcl,
        });
        confirmed = true;
      } catch (err) {
        const logMessage =
          err instanceof Error ? err.message : 'S3 confirm (move) failed';
        throw HttpException.badGateway(ErrorCode.UPLOAD_S3_CONFIRM_FAILED, {
          logMessage,
        });
      }
    }

    const urls = buildPublicUrlsForKeys(outPaths, bucket, region);
    return {
      file: outPaths,
      url: urls,
      confirmed,
    };
  },
};
