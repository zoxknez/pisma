import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
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

// GET single letter
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    // Rate limiting
    const rateLimitKey = user?.id || 'anonymous';
    const rateLimit = checkRateLimit(rateLimitKey, 'default');
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const letter = await prisma.letter.findUnique({
      where: { id },
      include: {
        reactions: {
          select: {
            id: true,
            emoji: true,
            userId: true,
            userName: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!letter) {
      throw new ApiError(404, 'Letter not found', 'NOT_FOUND');
    }

    // Check if user has access to this letter
    const hasAccess =
      letter.senderId === user?.id ||
      letter.recipientId === user?.id ||
      letter.recipientEmail === user?.email ||
      // Public letter (no specific recipient) - anyone with link can view
      (!letter.recipientId && !letter.recipientEmail);

    if (!hasAccess) {
      throw new ApiError(403, 'Access denied', 'FORBIDDEN');
    }

    // Check if letter is still locked (only for recipient, sender can always view)
    const isSender = letter.senderId === user?.id;
    const now = new Date();
    
    if (!isSender && now < new Date(letter.unlockAt)) {
      // Return limited info for locked letters
      return successResponse({
        id: letter.id,
        senderName: letter.senderName,
        unlockAt: letter.unlockAt,
        status: 'sealed',
        paperType: letter.paperType,
        sealColor: letter.sealColor,
        sealDesign: letter.sealDesign,
        sealInitials: letter.sealInitials,
        isLocked: true,
      });
    }

    return successResponse(letter);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE letter
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch letter to check ownership
    const letter = await prisma.letter.findUnique({
      where: { id },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        recipientEmail: true,
        status: true,
      },
    });

    if (!letter) {
      throw new ApiError(404, 'Letter not found', 'NOT_FOUND');
    }

    // Only sender can delete a letter (before it's opened)
    // Or recipient can "archive" (hide from their inbox)
    const isSender = letter.senderId === user.id;
    const isRecipient = 
      letter.recipientId === user.id || 
      letter.recipientEmail === user.email;

    if (!isSender && !isRecipient) {
      throw new ApiError(403, 'You cannot delete this letter', 'FORBIDDEN');
    }

    // If sender is deleting
    if (isSender) {
      // Can only delete if letter hasn't been opened yet
      if (letter.status === 'opened') {
        throw new ApiError(400, 'Cannot delete a letter that has been opened', 'ALREADY_OPENED');
      }

      // Delete the letter and related reactions
      await prisma.$transaction([
        prisma.reaction.deleteMany({ where: { letterId: id } }),
        prisma.letter.delete({ where: { id } }),
      ]);

      return successResponse({ 
        message: 'Letter deleted successfully',
        deleted: true,
      });
    }

    // If recipient is "deleting" (archiving)
    if (isRecipient) {
      // Mark as archived for recipient (soft delete)
      await prisma.letter.update({
        where: { id },
        data: {
          recipientArchived: true,
        },
      });

      return successResponse({ 
        message: 'Letter archived successfully',
        archived: true,
      });
    }

    throw new ApiError(400, 'Invalid delete operation', 'INVALID_OPERATION');
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH letter (for updates like archiving)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

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

    const letter = await prisma.letter.findUnique({
      where: { id },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        recipientEmail: true,
      },
    });

    if (!letter) {
      throw new ApiError(404, 'Letter not found', 'NOT_FOUND');
    }

    const isSender = letter.senderId === user.id;
    const isRecipient = 
      letter.recipientId === user.id || 
      letter.recipientEmail === user.email;

    if (!isSender && !isRecipient) {
      throw new ApiError(403, 'Access denied', 'FORBIDDEN');
    }

    // Allowed updates
    const updates: Record<string, unknown> = {};

    if (isRecipient && typeof body.archived === 'boolean') {
      updates.recipientArchived = body.archived;
    }

    if (isSender && typeof body.senderArchived === 'boolean') {
      updates.senderArchived = body.senderArchived;
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No valid updates provided', 'NO_UPDATES');
    }

    const updatedLetter = await prisma.letter.update({
      where: { id },
      data: updates,
    });

    return successResponse(updatedLetter);
  } catch (error) {
    return handleApiError(error);
  }
}
