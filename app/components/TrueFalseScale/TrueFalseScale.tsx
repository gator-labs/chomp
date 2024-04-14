import classNames from 'classnames';
import { Avatar } from '../Avatar/Avatar';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { useSteppingChange } from '@/app/hooks/useSteppingChange';
import { useState } from 'react';

type TrueFalseScaleProps = {
  ratioTrue?: number | null;
  valueSelected?: number | null;
  avatarSrc?: string;
  progressBarClassName?: string;
  handleRatioChange?: (percentage: number) => void;
  labelTrue?: string;
  labelFalse?: string;
};

export function TrueFalseScale({
  ratioTrue,
  valueSelected,
  avatarSrc,
  progressBarClassName,
  handleRatioChange,
  labelTrue = 'True',
  labelFalse = 'False',
}: TrueFalseScaleProps) {
  const avatarLeft = valueSelected
    ? valueSelected > 90
      ? 'calc(100% - 16px)'
      : `${valueSelected}%`
    : undefined;
  const { handlePercentageChange } = useSteppingChange({
    percentage: ratioTrue ?? 0,
    onPercentageChange: handleRatioChange,
  });

  const [isVisibleBackdrop, setIsVisibleBackdrop] = useState(false);

  return (
    <div className="relative">
      {isVisibleBackdrop && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50" />
      )}
      <ProgressBar
        percentage={
          ratioTrue === undefined || ratioTrue === null ? 100 : 100 - ratioTrue
        }
        progressColor="#8872A5"
        bgColor="#CFC5F7"
        className={classNames('h-[21px]', progressBarClassName)}
        onChange={percentage => handlePercentageChange(100 - percentage)}
        onTouchStart={() => setIsVisibleBackdrop(true)}
        onTouchEnd={() => setIsVisibleBackdrop(false)}
      />
      {valueSelected !== undefined && valueSelected !== null && avatarSrc && (
        <Avatar
          src={avatarSrc}
          size="extrasmall"
          className="absolute top-0.5"
          style={{ left: avatarLeft }}
        />
      )}
      <div className="flex justify-between text-white font-sora text-base font-semibold mt-2 z-50 relative">
        <span>
          {labelFalse}{' '}
          {ratioTrue === undefined || ratioTrue === null
            ? '0'
            : 100 - ratioTrue}
          %
        </span>
        <span>
          {labelTrue} {ratioTrue ?? '0'}%
        </span>
      </div>
    </div>
  );
}
