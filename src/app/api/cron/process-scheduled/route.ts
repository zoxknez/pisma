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

    const letters = await prisma.letter.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: now,
        },
      },
      take: 50,
    });

    console.log(`Found ${letters.length} scheduled letters to process`);

    const results = await Promise.allSettled(
      letters.map(async (letter: Letter) => {
        if (!letter.recipientEmail) return;

        await sendLetterNotification({
          recipientEmail: letter.recipientEmail,
          senderName: letter.senderName || 'Anonymous',
          letterId: letter.id,
          unlockAt: letter.unlockAt,
          language: ((letter as any).language as 'en' | 'sr') || 'en',
        });

        await prisma.letter.update({
          where: { id: letter.id },
          data: { status: 'sealed' },
        });
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;

    return NextResponse.json({ success: true, processed: successCount });
  } catch (error) {
    console.error('Scheduled cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
