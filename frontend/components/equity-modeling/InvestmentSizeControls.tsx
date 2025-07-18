import React from 'react';
import { Input } from '@/components/ui/input';
import type { PlaygroundShareHolding } from '@/lib/equity-modeling/types';

interface InvestmentSizeControlsProps {
  holding: PlaygroundShareHolding;
  onUpdateInvestment: (totalCents: number) => void;
  onUpdateShares: (shares: number) => void;
}

export default function InvestmentSizeControls({
  holding,
  onUpdateInvestment,
  onUpdateShares,
}: InvestmentSizeControlsProps) {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
          Total Investment
        </label>
        <Input
          type="number"
          min="0"
          step="10000"
          value={Math.round(holding.totalAmountInCents / 100)}
          onChange={(e) => {
            const newTotalCents = Math.round((parseFloat(e.target.value) || 0) * 100);
            onUpdateInvestment(newTotalCents);
          }}
          className="h-9 text-sm"
          placeholder="$0"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
          Number of Shares
        </label>
        <Input
          type="number"
          min="0"
          step="10000"
          value={holding.numberOfShares}
          onChange={(e) => {
            const newShares = parseInt(e.target.value) || 0;
            onUpdateShares(newShares);
          }}
          className="h-9 text-sm"
          placeholder="0"
        />
      </div>
    </>
  );
}