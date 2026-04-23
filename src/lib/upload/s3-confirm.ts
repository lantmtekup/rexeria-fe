/**
 * Tương đương nhánh S3 của `b`: `checkFileS3Storage` + `moveFileS3Storage`
 * (Nest `upload.service.ts` / `s3.service.ts`).
 * Không gồm nén ảnh đa kích thước (sharp) — mọi type được copy từ `upload/tmp`
 * sang `upload/image|video|audio|file` giống luồng fallback/move của backend.
 */

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3';
import path from 'path';

const TMP_PREFIX = path.posix.join('upload', 'tmp');

const sniffHeader = async (client: S3Client, bucket: string, key: string) => {
  const head = await client.send(
    new HeadObjectCommand({ Bucket: bucket, Key: key })
  );
  return { contentType: head.ContentType };
};

const readFirstBytes = async (
  client: S3Client,
  bucket: string,
  key: string,
  maxIndex: number
): Promise<Uint8Array> => {
  const res = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: `bytes=0-${maxIndex}`,
    })
  );
  if (!res.Body) throw new Error('S3 empty body on range read');
  return new Uint8Array(await res.Body.transformToByteArray());
};

const buildCopySource = (bucket: string, objectKey: string): string => {
  const encodedKey = objectKey
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/');
  return `${bucket}/${encodedKey}`;
};

/** Giống `moveFileS3Storage`: copy rồi xóa object tmp. */
const moveTmpTo = async (
  client: S3Client,
  bucket: string,
  srcKey: string,
  destKey: string,
  useAclPublicRead: boolean
): Promise<void> => {
  const base = {
    Bucket: bucket,
    CopySource: buildCopySource(bucket, srcKey),
    Key: destKey,
  };
  try {
    await client.send(
      new CopyObjectCommand({
        ...base,
        ...(useAclPublicRead ? { ACL: 'public-read' as const } : {}),
      })
    );
  } catch (e: unknown) {
    const err = e as { name?: string; Code?: string };
    if (
      useAclPublicRead &&
      (err?.name === 'AccessControlListNotSupported' ||
        err?.Code === 'AccessControlListNotSupported')
    ) {
      await client.send(new CopyObjectCommand(base));
    } else {
      throw e;
    }
  }
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: srcKey }));
};

const destFolderFromMime = (
  mimeFromBuffer: string | undefined,
  headContentType: string | undefined
): string => {
  const mime = mimeFromBuffer ?? headContentType ?? '';
  const lower = mime.toLowerCase();
  if (lower.startsWith('image/')) return path.posix.join('upload', 'image');
  if (lower.startsWith('video/')) return path.posix.join('upload', 'video');
  if (lower === 'audio/mpeg') return path.posix.join('upload', 'audio');
  return path.posix.join('upload', 'file');
};

const objectKey = (bucketPath: string, ...segments: string[]) =>
  path.posix.join(bucketPath, ...segments);

/**
 * @param tmpBasenames chỉ tên file trong `upload/tmp` (như Nest truyền vào `checkFileS3Storage`).
 * @returns Full S3 keys sau khi confirm (có `bucketPath` nếu env có).
 */
export const confirmS3TmpFiles = async (opts: {
  client: S3Client;
  bucket: string;
  bucketPath: string;
  tmpBasenames: string[];
  useAclPublicRead: boolean;
}): Promise<string[]> => {
  const { client, bucket, bucketPath, tmpBasenames, useAclPublicRead } = opts;
  const out: string[] = [];

  for (const basename of tmpBasenames) {
    const srcKey = objectKey(bucketPath, TMP_PREFIX, basename);

    const { contentType } = await sniffHeader(client, bucket, srcKey);

    const sample = await readFirstBytes(client, bucket, srcKey, 4099);
    let mimeFromBuffer: string | undefined;
    try {
      const { fileTypeFromBuffer } = await import('file-type');
      const ft = await fileTypeFromBuffer(sample);
      mimeFromBuffer = ft?.mime;
    } catch {
      mimeFromBuffer = undefined;
    }

    const destRel = destFolderFromMime(mimeFromBuffer, contentType);
    const destKey = objectKey(bucketPath, destRel, basename);

    await moveTmpTo(client, bucket, srcKey, destKey, useAclPublicRead);
    out.push(destKey);
  }

  return out;
};
