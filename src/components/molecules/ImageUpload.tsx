'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { Trash2, Upload } from 'lucide-react';

import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';
import { UPLOAD_CONSTANTS } from '@/lib/upload/constants';
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  UploadApiData,
} from '@/types/api';

export interface ImageUploadHandle {
  upload(): Promise<string>;
}

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(
  function ImageUpload(
    { value, onChange, disabled, className, imageWidth, imageHeight },
    ref
  ) {
    const tErrors = useTranslations('errors');
    const tUpload = useTranslations('upload');
    const inputRef = useRef<HTMLInputElement>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const blobUrlRef = useRef<string | null>(null);

    useEffect(() => {
      return () => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        async upload(): Promise<string> {
          if (!pendingFile) return value;

          setUploading(true);
          setError(null);
          try {
            const formData = new FormData();
            formData.append('file', pendingFile);

            const res = await fetch('/api/upload', {
              method: 'POST',
              credentials: 'include',
              body: formData,
            });
            const result = (await res.json()) as
              ApiSuccessResponse<UploadApiData> | ApiErrorResponse;

            if (!res.ok || result.success !== true) {
              const code =
                result.success === false ? result.code : 'CLIENT_UPLOAD_FAILED';
              throw new Error(
                (tErrors as (key: string) => string)(String(code))
              );
            }

            const url = result.data.url[0] ?? result.data.file[0];
            if (!url)
              throw new Error(
                (tErrors as (key: string) => string)('CLIENT_NO_IMAGE_URL')
              );

            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current);
              blobUrlRef.current = null;
            }
            setPendingFile(null);
            onChange(url);
            return url;
          } catch (e) {
            const msg =
              e instanceof Error
                ? e.message
                : (tErrors as (key: string) => string)('CLIENT_UPLOAD_FAILED');
            setError(msg);
            throw e;
          } finally {
            setUploading(false);
          }
        },
      }),
      [pendingFile, value, onChange, tErrors]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > UPLOAD_CONSTANTS.MAX_FILE_BYTES) {
        toast.error(
          tUpload('fileTooLarge', {
            maxMb: UPLOAD_CONSTANTS.MAX_FILE_MB,
          })
        );
        e.target.value = '';
        return;
      }

      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

      const blobUrl = URL.createObjectURL(file);
      blobUrlRef.current = blobUrl;
      setPendingFile(file);
      setError(null);
      onChange(blobUrl);
      e.target.value = '';
    };

    const handleRemove = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setPendingFile(null);
      setError(null);
      onChange('');
    };

    const isDisabled = disabled || uploading;

    return (
      <div className='flex flex-col gap-2'>
        <input
          ref={inputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          className='hidden'
          onChange={handleFileChange}
          disabled={isDisabled}
          aria-label={tUpload('pickImageAria')}
        />

        {value ? (
          <div className='relative w-full overflow-hidden rounded-md'>
            <div
              className={cn(
                'relative w-full cursor-pointer',
                imageWidth || imageHeight
                  ? 'flex items-center justify-center'
                  : '',
                className ?? 'h-70'
              )}
              onClick={() => !isDisabled && inputRef.current?.click()}
              title={tUpload('changeImageTitle')}
            >
              {imageWidth || imageHeight ? (
                <Image
                  src={value}
                  alt={tUpload('selectedImageAlt')}
                  width={imageWidth ?? 0}
                  height={imageHeight ?? 0}
                  unoptimized={value.startsWith('blob:')}
                  className='object-contain'
                />
              ) : (
                <Image
                  src={value}
                  alt={tUpload('selectedImageAlt')}
                  fill
                  unoptimized={value.startsWith('blob:')}
                  className={cn('object-cover', className)}
                />
              )}
            </div>
            <Button
              type='button'
              size='icon'
              variant='destructive'
              className='absolute top-2 right-2 size-8 shadow'
              onClick={handleRemove}
              disabled={isDisabled}
              aria-label={tUpload('removeImageAria')}
            >
              <Trash2 className='size-4' />
            </Button>
          </div>
        ) : (
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            disabled={isDisabled}
            className={cn(
              'border-border bg-muted/30 hover:bg-muted/60 flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              className ?? 'h-70'
            )}
          >
            <Upload className='text-muted-foreground size-5' />
            <span className='text-muted-foreground text-xs'>
              {tUpload('clickToPick')}
            </span>
          </button>
        )}

        {error && <p className='text-destructive text-xs'>{error}</p>}
      </div>
    );
  }
);

export default ImageUpload;
