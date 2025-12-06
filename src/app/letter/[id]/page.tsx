import prisma from '@/lib/prisma';
import LetterView from './LetterView';
import { notFound } from 'next/navigation';
import type { LetterWithReactions, SealDesign, PaperType, LetterStatus, RecurringType, TemplateType, LetterStyle } from '@/types';

interface ReactionWithUser {
  emoji: string;
  user: { name: string | null };
}

import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const letter = await prisma.letter.findUnique({
    where: { id },
    select: { senderName: true, status: true }
  });

  if (!letter) {
    return {
      title: 'Letter Not Found',
    };
  }

  const sender = letter.senderName || 'Someone';
  const title = letter.status === 'sealed' 
    ? `A sealed letter from ${sender}`
    : `A letter from ${sender}`;

  return {
    title: `${title} | Pisma`,
    description: 'You have received a digital letter. Open it to read the message.',
    openGraph: {
      title: `${title} | Pisma`,
      description: 'You have received a digital letter. Open it to read the message.',
    },
  };
}

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const letter = await prisma.letter.findUnique({
    where: { id },
    include: {
      reactions: {
        include: {
          user: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!letter) {
    notFound();
  }

  // Type-safe conversion
  const letterWithReactions: LetterWithReactions = {
    ...letter,
    status: letter.status as LetterStatus,
    paperType: letter.paperType as PaperType,
    sealDesign: letter.sealDesign as SealDesign,
    templateType: letter.templateType as TemplateType | null,
    recurringType: letter.recurringType as RecurringType | null,
    letterStyle: (letter.letterStyle || 'minimal') as LetterStyle,
    isAnonymous: letter.isAnonymous ?? false,
    isPublic: letter.isPublic ?? false,
    reactions: letter.reactions.map((r: ReactionWithUser) => ({
      emoji: r.emoji,
      userName: r.user.name || undefined
    }))
  };

  return <LetterView letter={letterWithReactions} />;
}
