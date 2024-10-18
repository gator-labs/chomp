'use client';

import gatorHeadImage from '@/public/images/gator-head.png';
import { CircleArrowRight, Share2 } from 'lucide-react';
import { useRouter } from 'next-nprogress-bar';
import Image from 'next/image';
import { Button } from '../ui/button';
import { QUESTION_CARD_CONTENT } from './constants';
import { usePathname } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { HomeIcon } from '../Icons/HomeIcon';

type NoQuestionsCardProps = {
  variant:
    | 'daily-deck'
    | 'regular-deck'
    | 'answer-page'
    | 'answered-none'
    | 'answered-some';
  nextDeckId?: number;
  deckRevealAtDate?: Date | null;
};

export function NoQuestionsCard({
  variant,
  nextDeckId,
  deckRevealAtDate,
}: NoQuestionsCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full w-full gap-4">
      <div className="bg-gray-700 h-[350px] w-full max-w-[480px] rounded-xl pt-6 pl-4 pr-4 flex flex-col justify-between border border-gray-500 text-white relative mb-[4px] overflow-scroll">
        <div className="flex items-start justify-start text-left flex-col space-y-5">
          <div className="text-[24px] font-bold w-full text-purple-200">
            {QUESTION_CARD_CONTENT[variant].title}
          </div>
          <div className="text-[14px] relative z-10">
            {QUESTION_CARD_CONTENT[variant].body(deckRevealAtDate)}
          </div>
        </div>

        <Image
          src={gatorHeadImage}
          alt="gator-head"
          className="absolute bottom-0 left-0 w-full"
          style={{ zIndex: 1 }}
        />
      </div>
      {nextDeckId ? (
        <Button
          className="text-[14px] gap-2"
          onClick={() => {
            if (pathname.endsWith('answer')) return window.location.reload();

            router.replace(`/application/decks/${nextDeckId}`);
            router.refresh();
          }}
        >
          Next Deck <CircleArrowRight />
        </Button>
      ) : (
        <Button
          className="text-[14px] gap-2"
          onClick={() => {
            router.replace('/application');
            router.refresh();
          }}
        >
          Go Home <CircleArrowRight />
        </Button>
      )}
      {!!nextDeckId && pathname.endsWith('answer') && (
        <Button
          variant="outline"
          className="text-[14px] gap-2"
          onClick={() => {
            router.replace('/application');
            router.refresh();
          }}
        >
          Go Home <HomeIcon />
        </Button>
      )}
    </div>
  );
}
