import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PlatformStats {
  overview: {
    totalUsers: number;
    totalLetters: number;
    lettersDeliveredToday: number;
    lettersInTransit: number;
  };
  userStats?: {
    lettersSent: number;
    lettersReceived: number;
    unopenedLetters: number;
    reactionsReceived: number;
  };
  trends: {
    period: string;
    lettersSent: number;
    deliveryRate: number;
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Public platform statistics
    const [totalUsers, totalLetters, lettersToday, lettersInTransit] = await Promise.all([
      prisma.user.count(),
      prisma.letter.count(),
      prisma.letter.count({
        where: {
          unlockAt: {
            gte: todayStart,
            lte: now,
          },
        },
      }),
      prisma.letter.count({
        where: {
          unlockAt: {
            gt: now,
          },
        },
      }),
    ]);

    // Weekly trend
    const weeklyLetters = await prisma.letter.count({
      where: {
        createdAt: {
          gte: weekAgo,
        },
      },
    });

    const weeklyDelivered = await prisma.letter.count({
      where: {
        createdAt: {
          gte: weekAgo,
        },
        unlockAt: {
          lte: now,
        },
      },
    });

    const stats: PlatformStats = {
      overview: {
        totalUsers,
        totalLetters,
        lettersDeliveredToday: lettersToday,
        lettersInTransit,
      },
      trends: {
        period: 'last_7_days',
        lettersSent: weeklyLetters,
        deliveryRate: weeklyLetters > 0 ? Math.round((weeklyDelivered / weeklyLetters) * 100) : 0,
      },
    };

    // Personal stats for authenticated users
    if (session?.user?.id) {
      const userId = session.user.id;
      const userEmail = session.user.email;

      const [sentCount, receivedCount, unopenedCount, reactionsCount] = await Promise.all([
        prisma.letter.count({
          where: { senderId: userId },
        }),
        prisma.letter.count({
          where: { recipientEmail: userEmail || '' },
        }),
        prisma.letter.count({
          where: {
            recipientEmail: userEmail || '',
            openedAt: null,
            unlockAt: { lte: now },
          },
        }),
        prisma.reaction.count({
          where: {
            letter: {
              senderId: userId,
            },
          },
        }),
      ]);

      stats.userStats = {
        lettersSent: sentCount,
        lettersReceived: receivedCount,
        unopenedLetters: unopenedCount,
        reactionsReceived: reactionsCount,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
