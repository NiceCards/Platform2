import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import config from '../config/env.js';

/**
 * Cloudflare R2 storage service.
 *
 * Product images are uploaded to an R2 bucket and served from its public URL
 * (r2.dev subdomain or a custom domain). MongoDB only keeps the resulting URL,
 * which keeps documents small and lets the browser cache images aggressively.
 *
 * When R2 is not configured (e.g. local development without credentials), the
 * service transparently falls back to an inline base64 data URI so the app
 * keeps working without any cloud account.
 */

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

let client = null;

export const isStorageConfigured = () =>
  Boolean(
    config.r2.accountId &&
      config.r2.accessKeyId &&
      config.r2.secretAccessKey &&
      config.r2.bucket &&
      config.r2.publicUrl
  );

const getClient = () => {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
      },
    });
  }
  return client;
};

const normalizeBaseUrl = () => (config.r2.publicUrl || '').replace(/\/+$/, '');

const toDataUri = (buffer, mimetype) =>
  `data:${mimetype || 'application/octet-stream'};base64,${buffer.toString('base64')}`;

const extensionFor = (mimetype, originalName) => {
  if (MIME_EXTENSIONS[mimetype]) return MIME_EXTENSIONS[mimetype];
  const ext = (originalName || '').toLowerCase().split('.').pop();
  return ext && /^[a-z0-9]+$/.test(ext) ? ext : 'bin';
};

const buildKey = (prefix, ext) => `${prefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

/**
 * Uploads a raw buffer to Cloudflare R2 and returns the public URL.
 * Falls back to an inline base64 data URI when R2 is not configured.
 */
export const uploadBuffer = async ({ buffer, mimetype, originalName, prefix = 'products' }) => {
  if (!isStorageConfigured()) {
    return toDataUri(buffer, mimetype);
  }

  const key = buildKey(prefix, extensionFor(mimetype, originalName));
  await getClient().send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype || 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return `${normalizeBaseUrl()}/${key}`;
};

/**
 * Uploads a single multer (memory storage) file to Cloudflare R2.
 */
export const uploadImageFile = (file, prefix = 'products') =>
  uploadBuffer({
    buffer: file.buffer,
    mimetype: file.mimetype,
    originalName: file.originalname,
    prefix,
  });

/**
 * Deletes an image that was previously uploaded to R2.
 * URLs that do not belong to the configured bucket (or data URIs) are ignored.
 */
export const deleteImageByUrl = async (url) => {
  if (!url || !isStorageConfigured()) return false;

  const base = normalizeBaseUrl();
  if (!url.startsWith(`${base}/`)) return false;

  const key = url.slice(base.length + 1);
  if (!key) return false;

  await getClient().send(new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: key }));
  return true;
};
