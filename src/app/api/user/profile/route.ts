import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import {
  checkRateLimit,
  rateLimitResponse,
  handleApiError,
  ApiError,
  successResponse,
} from '@/lib/api-utils';
import { sanitizeString } from '@/lib/validations';

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').transform(sanitizeString).optional(),
  notificationsEnabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const user = session.user as SessionUser;

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            sentLetters: true,
            receivedLetters: true,
          },
        },
      },
    });

    if (!profile) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const user = session.user as SessionUser;

    // Rate limiting
    const rateLimit = checkRateLimit(user.id, 'sensitive');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      throw new ApiError(400, result.error.errors[0].message, 'VALIDATION_ERROR');
    }

    const updates: Record<string, unknown> = {};
    
    if (result.data.name !== undefined) {
      updates.name = result.data.name;
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No valid updates provided', 'NO_UPDATES');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const user = session.user as SessionUser;

    // Rate limiting for sensitive operations
    const rateLimit = checkRateLimit(user.id, 'sensitive');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Delete user and all related data (cascades)
    await prisma.$transaction([
      // Delete all reactions by this user
      prisma.reaction.deleteMany({ where: { userId: user.id } }),
      // Delete all letters sent by this user
      prisma.letter.deleteMany({ where: { senderId: user.id } }),
      // Delete sessions
      prisma.session.deleteMany({ where: { userId: user.id } }),
      // Delete accounts
      prisma.account.deleteMany({ where: { userId: user.id } }),
      // Finally delete user
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return successResponse({ message: 'Account deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
