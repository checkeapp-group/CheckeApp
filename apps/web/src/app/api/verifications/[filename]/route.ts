import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  const { filename } = params;

  const filePath = path.join(process.cwd(), 'public','verifications', params.filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new Response(fileBuffer, {
    headers: { 'Content-Type': 'image/png' },
  });

  console.log('Requested file:', filename);

  return NextResponse.json({ requestedFile: filename });
}
