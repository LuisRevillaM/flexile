import React, { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { formatCompactMoney } from '@/utils/formatMoney';

interface MinimalExitSliderProps {
  exitAmountCents: bigint;
  onExitAmountChange: (exitAmountCents: bigint) => void;
  maxAmount?: number; // Maximum in dollars
  className?: string;
}

export default function MinimalExitSlider({
  exitAmountCents,
  onExitAmountChange,
  maxAmount = 100_000_000, // $100M default
  className = '',
}: MinimalExitSliderProps) {
  const maxAmountCents = maxAmount * 100;
  const currentCents = Number(exitAmountCents);
  
  const handleSliderChange = useCallback((values: number[]) => {
    const newAmountCents = BigInt(values[0]);
    onExitAmountChange(newAmountCents);
  }, [onExitAmountChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current amount display */}
      <div className="text-center">
        <span className="text-2xl font-semibold text-gray-900">
          {formatCompactMoney(currentCents)}
        </span>
      </div>

      {/* Slider with min/max labels */}
      <div className="space-y-2">
        <Slider
          value={[Math.min(currentCents, maxAmountCents)]}
          onValueChange={handleSliderChange}
          max={maxAmountCents}
          min={0}
          step={100_000} // $1K steps
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>$0</span>
          <span>{formatCompactMoney(maxAmountCents)}</span>
        </div>
      </div>
    </div>
  );
}