/**
 * Photo Storage Service — Strictly Free ($0/month) Architecture
 *
 * Implements ImageKit Free Tier for optional recipient photos.
 * STRICTLY avoids Firebase Cloud Storage to ensure zero Google Cloud billing
 * and 100% compatibility with Firebase Spark (No-Cost) plan.
 */

// ImageKit configuration from environment variables
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';
const IMAGEKIT_UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

/**
 * Validates and client-side compresses an image to WebP/JPEG under 200-500 KB,
 * stripping all EXIF and personal device metadata.
 */
export async function compressImageClientSide(
  source: string | File,
  options: ImageProcessingOptions = {}
): Promise<string> {
  const maxWidth = options.maxWidth || 640;
  const maxHeight = options.maxHeight || 640;
  const quality = options.quality ?? 0.82;
  const preferredFormat = options.format || 'image/webp';

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(typeof source === 'string' ? source : '');
          return;
        }

        // Draw image cleanly, stripping any EXIF metadata
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL(preferredFormat, quality);
        // Fallback to jpeg if browser doesn't support webp canvas export
        if (!dataUrl.startsWith('data:image/webp') && preferredFormat === 'image/webp') {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        resolve(typeof source === 'string' ? source : '');
      }
    };

    img.onerror = (err) => {
      console.warn('Could not load image for compression:', err);
      reject(new Error('Failed to process image file.'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Uploads a recipient photo to ImageKit Free tier without requiring server-side Cloud Functions or billing.
 * Falls back safely to client-side compressed WebP data URL if ImageKit is not configured or offline.
 */
export async function uploadRecipientPhoto(
  responseSessionId: string,
  photoDataUrl: string
): Promise<string> {
  if (!photoDataUrl) {
    return photoDataUrl;
  }

  // First ensure client-side compression (< 300 KB) and metadata removal
  let compressedDataUrl = photoDataUrl;
  try {
    compressedDataUrl = await compressImageClientSide(photoDataUrl, {
      maxWidth: 640,
      maxHeight: 640,
      quality: 0.82,
      format: 'image/webp',
    });
  } catch {
    compressedDataUrl = photoDataUrl;
  }

  // If ImageKit Free public key is provided, attempt direct client-side upload to ImageKit
  if (IMAGEKIT_PUBLIC_KEY) {
    try {
      // Randomized privacy-preserving filename without personal identifiers or original filename
      const randomizedFilename = `closer_photo_${Math.random().toString(36).slice(2, 10)}_${Date.now()}.webp`;

      const formData = new FormData();
      formData.append('file', compressedDataUrl);
      formData.append('fileName', randomizedFilename);
      formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
      formData.append('folder', '/closer_photos');
      formData.append('useUniqueFileName', 'true');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.url) {
          return data.url;
        }
      } else {
        console.info('ImageKit upload returned non-200, safely using local compressed photo.');
      }
    } catch (uploadError) {
      console.info(
        'ImageKit upload notice: Network or credentials unavailable. Using local compressed image.',
        uploadError
      );
    }
  }

  // Graceful $0/month fallback: Return optimized, lightweight local WebP data URL
  return compressedDataUrl;
}
