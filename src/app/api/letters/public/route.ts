import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError, successResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const [letters, total] = await Promise.all([
      prisma.letter.findMany({
        where: {
          isPublic: true,
          status: { not: 'sealed' }, // Only show opened/delivered letters? Or sealed too?
          // Usually public letters should be readable, so maybe only unlocked ones?
          // But the "Community Wall" might show sealed letters as "Coming Soon"?
          // Let's show all, but content is hidden if sealed.
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          senderName: true,
          createdAt: true,
          unlockAt: true,
          status: true,
          sealColor: true,
          sealDesign: true,
          paperType: true,
          message: true, // We need message for preview if unlocked
        },
      }),
      prisma.letter.count({
        where: { isPublic: true },
      }),
    ]);

    // Filter message content if sealed
    const sanitizedLetters = letters.map(letter => {
      const isLocked = new Date() < new Date(letter.unlockAt);
      return {
        ...letter,
        message: isLocked ? null : letter.message,
        isLocked,
      };
    });

    return successResponse({
      letters: sanitizedLetters,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
