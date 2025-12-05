import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { letterQuerySchema } from '@/lib/validations';
import {
  checkRateLimit,
  rateLimitResponse,
  handleApiError,
  ApiError,
  successResponse,
} from '@/lib/api-utils';
import type { AuthenticatedUser } from '@/lib/api-utils';

// Type for session user with id
interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const user = session.user as SessionUser;
    
    // Rate limiting
    const rateLimit = checkRateLimit(user.id, 'default');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const queryResult = letterQuerySchema.safeParse({
      type: searchParams.get('type') || 'received',
    });

    if (!queryResult.success) {
      throw new ApiError(400, 'Invalid query parameters', 'VALIDATION_ERROR');
    }

    const { type } = queryResult.data;
    const userId = user.id;

    // Build query based on type
    const whereClause = type === 'received'
      ? {
          OR: [
            { recipientId: userId },
            { recipientEmail: session.user.email },
          ],
        }
      : { senderId: userId };

    const letters = await prisma.letter.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        senderName: true,
        recipientName: true,
        status: true,
        createdAt: true,
        unlockAt: true,
        paperType: true,
        sealColor: true,
        sealDesign: true,
        sealInitials: true,
        templateType: true,
        agingEnabled: true,
      },
    });

    return successResponse(letters);
  } catch (error) {
    return handleApiError(error);
  }
}
