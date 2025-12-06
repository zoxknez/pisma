import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendLetterNotification } from '@/lib/email';
import { Letter } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Find all recurring letters
    const letters = await prisma.letter.findMany({
      where: {
        isRecurring: true,
        // We process letters regardless of status, as long as they are recurring
      },
    });

    const dueLetters = letters.filter(letter => {
      const unlockDate = new Date(letter.unlockAt);
      
      // Skip if it's the same year (don't recur on the day of creation/unlock)
      // Unless we want to? Usually recurrence starts the NEXT period.
      // But for simplicity, let's just check day/month match.
      // If unlockAt is today, it might send double email if we are not careful.
      // But unlockAt includes time.
      
      if (letter.recurringType === 'yearly') {
        return unlockDate.getMonth() === currentMonth && unlockDate.getDate() === currentDay && unlockDate.getFullYear() !== now.getFullYear();
      }
      
      if (letter.recurringType === 'monthly') {
        // Check if it's not the same month/year as unlockAt
        const isSameMonth = unlockDate.getMonth() === currentMonth && unlockDate.getFullYear() === now.getFullYear();
        return unlockDate.getDate() === currentDay && !isSameMonth;
      }
      
      return false;
    });

    console.log(`Found ${dueLetters.length} recurring letters due today`);

    const results = await Promise.allSettled(
      dueLetters.map(async (letter: Letter) => {
        if (!letter.recipientEmail) return;

        await sendLetterNotification({
          recipientEmail: letter.recipientEmail,
          senderName: letter.senderName || 'Anonymous',
          letterId: letter.id,
          unlockAt: now,
          language: ((letter as any).language as 'en' | 'sr') || 'en',
        });
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;

    return NextResponse.json({ success: true, processed: successCount });
  } catch (error) {
    console.error('Recurring cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
