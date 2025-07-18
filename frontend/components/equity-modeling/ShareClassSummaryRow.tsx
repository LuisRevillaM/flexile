import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatMoneyFromCents } from '@/utils/formatMoney';
import type { PlaygroundShareClass, PlaygroundShareHolding } from '@/lib/equity-modeling/types';

interface ShareClassSummaryRowProps {
  shareClass: PlaygroundShareClass;
  holding: PlaygroundShareHolding | undefined;
  index: number;
  isExpanded: boolean;
  onClick: () => void;
}

export default function ShareClassSummaryRow({
  shareClass,
  holding,
  index,
  isExpanded,
  onClick,
}: ShareClassSummaryRowProps) {
  return (
    <div
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center">
        {/* Left section - Fixed width */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ChevronRight
            className={`size-4 text-gray-400 transition-transform flex-shrink-0 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
          <span className="text-sm font-medium text-gray-900 truncate">
            {shareClass.name}
          </span>
          {shareClass.isHypothetical && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              (Draft)
            </span>
          )}
        </div>

        {/* Center section - Type and price */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="hidden sm:inline">
            {shareClass.preferred ? 'Preferred' : 'Common'}
          </span>
          <span>
            {formatMoneyFromCents(shareClass.originalIssuePriceInDollars * 100)}/share
          </span>
        </div>

        {/* Right section - Amount */}
        {holding && (
          <span className="text-sm font-medium text-gray-900 ml-6 w-20 text-right">
            {formatMoneyFromCents(holding.totalAmountInCents)}
          </span>
        )}
      </div>
    </div>
  );
}