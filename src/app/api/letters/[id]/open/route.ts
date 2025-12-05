import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendLetterDeliveredNotification } from '@/lib/email';
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
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get session for authorization
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    // Rate limiting (allow unauthenticated but limit by letter ID)
    const rateLimitKey = user?.id || id;
    const rateLimit = checkRateLimit(rateLimitKey, 'sensitive');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Fetch letter first to check authorization
    const letter = await prisma.letter.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        unlockAt: true,
        recipientId: true,
        recipientEmail: true,
        senderId: true,
        senderName: true,
        isPublic: true,
      },
    });

    if (!letter) {
      throw new ApiError(404, 'Letter not found', 'NOT_FOUND');
    }

    // Authorization check: only recipient can open, unless it's public
    const isRecipient = 
      (user?.id && letter.recipientId === user.id) ||
      (user?.email && letter.recipientEmail === user.email) ||
      // Allow opening if letter has no specific recipient or is public
      (!letter.recipientId && !letter.recipientEmail) ||
      letter.isPublic;

    if (!isRecipient) {
      throw new ApiError(403, 'You are not authorized to open this letter', 'FORBIDDEN');
    }

    // Check if letter is still locked
    const now = new Date();
    if (now < new Date(letter.unlockAt)) {
      throw new ApiError(403, 'This letter is still sealed', 'LETTER_LOCKED');
    }

    // Check if already opened
    if (letter.status === 'opened') {
      return successResponse({ message: 'Letter already opened', letter });
    }

    // Update letter status
    const updatedLetter = await prisma.letter.update({
      where: { id },
      data: {
        status: 'opened',
        openedAt: new Date(),
        // Link recipient if authenticated
        ...(user?.id && !letter.recipientId ? { recipientId: user.id } : {}),
      },
    });

    // Send notification to sender that letter was opened (optional feature)
    // You could add sender notification here

    return successResponse(updatedLetter);
  } catch (error) {
    return handleApiError(error);
  }
}
