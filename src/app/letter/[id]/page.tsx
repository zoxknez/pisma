import prisma from '@/lib/prisma';
import LetterView from './LetterView';
import { notFound } from 'next/navigation';
import type { LetterWithReactions, SealDesign, PaperType, LetterStatus, RecurringType, TemplateType } from '@/types';

interface ReactionWithUser {
  emoji: string;
  user: { name: string | null };
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
    reactions: letter.reactions.map((r: ReactionWithUser) => ({
      emoji: r.emoji,
      userName: r.user.name || undefined
    }))
  };

  return <LetterView letter={letterWithReactions} />;
}
