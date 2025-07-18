import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatMoneyFromCents, formatCompactMoney } from '@/utils/formatMoney';
import type { PlaygroundConvertibleSecurity } from '@/lib/equity-modeling/types';

interface ConvertibleSummaryRowProps {
  security: PlaygroundConvertibleSecurity;
  investorName: string;
  isExpanded: boolean;
  onClick: () => void;
}

export default function ConvertibleSummaryRow({
  security,
  investorName,
  isExpanded,
  onClick,
}: ConvertibleSummaryRowProps) {
  const isNote = security.interestRatePercent !== undefined;
  
  return (
    <div
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center">
        {/* Left section */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ChevronRight
            className={`size-4 text-gray-400 transition-transform flex-shrink-0 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
          <span className="text-sm font-medium text-gray-900">
            {isNote ? 'Note' : 'SAFE'}
          </span>
          <span className="text-sm text-gray-500 truncate">
            {investorName}
          </span>
        </div>

        {/* Right section - Amount */}
        <span className="text-sm font-medium text-gray-900 ml-6">
          {formatCompactMoney(security.principalValueInCents)}
        </span>
      </div>
    </div>
  );
}