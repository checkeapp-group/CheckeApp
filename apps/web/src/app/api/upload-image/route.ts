import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

// API endpoint for uploading verification result images
export async function POST(request: Request) {
  try {
    const UPLOAD_DIR = path.join(process.cwd(), 'public', 'verifications');

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const fileName = formData.get('fileName') as string | null;

    if (!(file && fileName)) {
      return NextResponse.json({ error: 'No file or fileName provided.' }, { status: 400 });
    }

    if (!fileName.match(/^[\w-]+\.webp$/)) {
      return NextResponse.json({ error: 'Invalid file name.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verifications/${fileName}`;

    return NextResponse.json({ success: true, path: publicUrl });
  } catch (error) {
    console.error('[WEB API] Error uploading image:', error);
    return NextResponse.json(
      { error: 'Image upload failed.', details: (error as Error).message },
      { status: 500 }
    );
  }
}
