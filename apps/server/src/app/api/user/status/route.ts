import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { user } from '@/db/schema/auth';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the session from request headers
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Query the database for the user's verification status
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        isVerified: true,
      },
    });

    // Check if user exists
    if (!userRecord) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Return the verification status
    return NextResponse.json(
      {
        isVerified: userRecord.isVerified,
      },
      { status: 200 }
    );

  } catch (error) {
    
    console.error('Error in /api/user/status:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
