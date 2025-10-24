import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const FRONTEND_UPLOAD_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/upload-image`;

export async function processAndDelegateImage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    const processedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 1920, height: 1080, fit: 'cover' })
      .webp({ quality: 90 })
      .toBuffer();

    const fileName = `${uuidv4()}.webp`;
    const formData = new FormData();
    formData.append('image', new Blob([processedImageBuffer]), fileName);
    formData.append('fileName', fileName);

    const uploadResponse = await fetch(FRONTEND_UPLOAD_URL, {
      method: 'POST',
      body: formData,
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
