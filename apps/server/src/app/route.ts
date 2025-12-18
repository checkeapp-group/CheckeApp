import { NextResponse } from 'next/server';

// Root health check endpoint returning OK status
export async function GET() {
  return NextResponse.json({ message: 'OK' });
}
