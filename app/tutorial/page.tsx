'use client';

import React, { useState } from 'react';
import { Button } from '../components/Button/Button';
import Link from 'next/link';
import { TUTORIAL_STEPS } from './constants';
import { useRouter } from 'next/navigation';

const TutorialPage = () => {
  const [currentTutorialStep, setCurrentTutorialStep] = useState<number | null>(
    null
  );
  const router = useRouter();

  const lastTutorialStep = TUTORIAL_STEPS.length - 1;
  const firstTutorialStep = 0;

  const handlePrevClick = () => {
    if (currentTutorialStep === firstTutorialStep)
      return setCurrentTutorialStep(null);

    setCurrentTutorialStep(prevTutorialStep => prevTutorialStep! - 1);
  };

  const handleNextClick = () => {
    if (currentTutorialStep === lastTutorialStep)
      return router.push('/application');

    setCurrentTutorialStep(prevTutorialStep => prevTutorialStep! + 1);
  };

  return (
    <div className="max-w-7xl w-full px-4 mx-auto flex flex-col justify-center items-center h-full">
      {currentTutorialStep !== null ? (
        <>
          <div className="mt-auto px-4 flex flex-col justify-start md:items-center gap-3 w-full">
            {TUTORIAL_STEPS[currentTutorialStep].text}
          </div>

          <div className="flex w-full gap-8 mt-auto py-10 [&_*]:p-0">
            <Button
              variant="pink-border"
              className="h-[64px] flex-1"
              size="big"
              onClick={handlePrevClick}
            >
              Previous
            </Button>
            <Button
              variant="pink"
              className="h-[64px] flex-1"
              size="big"
              onClick={handleNextClick}
            >
              {currentTutorialStep === lastTutorialStep ? 'Start' : 'Next'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center mb-8 gap-3">
            <p className="text-center text-sm">Welcome</p>
            <p className="text-center text-sm">
              Your daily deck is ready, would you like to view a quick tutorial
              before you begin?
            </p>
          </div>

          <Button
            variant="primary"
            className="max-w-[296px] mb-2"
            onClick={() => setCurrentTutorialStep(0)}
          >
            View Tutorial
          </Button>

          <Link href="/application" className="text-sm underline">
            Skip tutorial
          </Link>
        </>
      )}
    </div>
  );
};

export default TutorialPage;
