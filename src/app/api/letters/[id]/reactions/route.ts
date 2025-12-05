import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { reactionSchema } from '@/lib/validations';
import {
  checkRateLimit,
  rateLimitResponse,
  handleApiError,
  ApiError,
  successResponse,
} from '@/lib/api-utils';

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const user = session.user as SessionUser;
    const { id: letterId } = await params;

    // Rate limiting
    const rateLimit = checkRateLimit(user.id, 'sensitive');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Parse and validate body
    const body = await request.json();
    const validationResult = reactionSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ApiError(400, 'Invalid emoji', 'VALIDATION_ERROR');
    }

    const { emoji } = validationResult.data;

    // Check if letter exists and is opened
    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      select: {
        id: true,
        status: true,
        senderId: true,
        recipientId: true,
        recipientEmail: true,
        isPublic: true,
      },
    });

    if (!letter) {
      throw new ApiError(404, 'Letter not found', 'NOT_FOUND');
    }

    // Only allow reactions on opened letters
    if (letter.status !== 'opened') {
      throw new ApiError(403, 'Cannot react to unopened letter', 'LETTER_NOT_OPENED');
    }

    // Check if user is sender, recipient, or if letter is public
    const isAuthorized =
      letter.isPublic ||
      letter.senderId === user.id ||
      letter.recipientId === user.id ||
      letter.recipientEmail === user.email;

    if (!isAuthorized) {
      throw new ApiError(403, 'You are not authorized to react to this letter', 'FORBIDDEN');
    }

    // Upsert reaction
    const reaction = await prisma.reaction.upsert({
      where: {
        letterId_userId: {
          letterId,
          userId: user.id,
        },
      },
      update: { emoji },
      create: {
        emoji,
        letterId,
        userId: user.id,
      },
    });

    return successResponse(reaction);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: letterId } = await params;

    // Rate limiting by letter ID for unauthenticated requests
    const rateLimit = checkRateLimit(letterId, 'default');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Check if letter exists
    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      select: { id: true, status: true },
    });

    if (!letter) {
      throw new ApiError(404, 'Letter not found', 'NOT_FOUND');
    }

    const reactions = await prisma.reaction.findMany({
      where: { letterId },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(
      reactions.map((r) => ({
        emoji: r.emoji,
        userName: r.user.name,
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const user = session.user as SessionUser;
    const { id: letterId } = await params;

    // Rate limiting
    const rateLimit = checkRateLimit(user.id, 'sensitive');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Delete user's reaction
    await prisma.reaction.deleteMany({
      where: {
        letterId,
        userId: user.id,
      },
    });

    return successResponse({ message: 'Reaction removed' });
  } catch (error) {
    return handleApiError(error);
  }
}
