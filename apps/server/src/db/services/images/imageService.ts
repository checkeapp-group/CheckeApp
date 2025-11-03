import { Blob } from 'fetch-blob';
import { FormData } from 'formdata-node';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const FRONTEND_INTERNAL_URL = 'http://web:3001';
const FRONTEND_UPLOAD_URL = `${FRONTEND_INTERNAL_URL}/api/upload-image`;

export async function processAndDelegateImage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const processedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 1000, height: 500, fit: 'cover' })
      .webp({ quality: 90 })
      .toBuffer();

    const uint8Array = new Uint8Array(processedImageBuffer);

    const fileName = `${uuidv4()}.webp`;
    const blob = new Blob([uint8Array], { type: 'image/webp' });

    const formData = new FormData();
    formData.append('image', blob, fileName);
    formData.append('fileName', fileName);

    const uploadResponse = await fetch(FRONTEND_UPLOAD_URL, {
      method: 'POST',
      body: formData as any,
    });

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.text();
      throw new Error(`Frontend image upload failed: ${uploadResponse.statusText} - ${errorBody}`);
    }

    const result = await uploadResponse.json();
    if (!(result.success && result.path)) {
      throw new Error('Frontend acknowledged upload, but did not return a valid path.');
    }

    console.log(`[ImageService] Image delegated to frontend and stored at: ${result.path}`);

    return result.path;
  } catch (error) {
    console.error('[ImageService] Error delegating image to frontend:', error);
    throw new Error('Image processing and delegation failed.');
  }
}
