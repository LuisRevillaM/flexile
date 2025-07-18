import React from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InvestmentSizeControls from './InvestmentSizeControls';
import type { PlaygroundShareClass, PlaygroundShareHolding } from '@/lib/equity-modeling/types';

interface ShareClassTermsGridProps {
  shareClass: PlaygroundShareClass;
  holding: PlaygroundShareHolding | undefined;
  onUpdate: (updates: Partial<PlaygroundShareClass>) => void;
  onUpdateInvestmentSize: (updates: { totalInvestmentCents?: number; numberOfShares?: number; pricePerShare?: number }) => void;
  onRemove?: () => void;
}

export default function ShareClassTermsGrid({
  shareClass,
  holding,
  onUpdate,
  onUpdateInvestmentSize,
  onRemove,
}: ShareClassTermsGridProps) {
  return (
    <div className="space-y-4">
      {/* Name Input with Delete - Full width */}
      {shareClass.isHypothetical && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Name
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={shareClass.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-9 text-sm flex-1"
              placeholder="Share class name"
            />
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Terms Grid */}
      <div className="grid grid-cols-2 gap-4">
      {/* Liquidation Preference */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Liquidation Preference
        </label>
        <Input
          type="number"
          min="0"
          step="0.5"
          value={shareClass.liquidationPreferenceMultiple}
          onChange={(e) => onUpdate({
            liquidationPreferenceMultiple: parseFloat(e.target.value) || 0
          })}
          className="h-9 text-sm"
          placeholder="1.0"
        />
      </div>

      {/* Participation */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Participation
        </label>
        <Select
          value={shareClass.participating ? (shareClass.participationCapMultiple ? 'capped' : 'full') : 'none'}
          onValueChange={(value) => {
            if (value === 'none') {
              onUpdate({ participating: false, participationCapMultiple: undefined });
            } else if (value === 'capped') {
              onUpdate({
                participating: true,
                participationCapMultiple: 3.0
              });
            } else {
              onUpdate({ participating: true, participationCapMultiple: undefined });
            }
          }}
        >
          <SelectTrigger className="h-9 text-sm w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Non-participating</SelectItem>
            <SelectItem value="capped">Capped participation</SelectItem>
            <SelectItem value="full">Full participation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Participation Cap (conditional) */}
      {shareClass.participating && shareClass.participationCapMultiple !== undefined && (
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Participation Cap
          </label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={shareClass.participationCapMultiple}
            onChange={(e) => onUpdate({
              participationCapMultiple: parseFloat(e.target.value) || 0
            })}
            className="h-9 text-sm"
            placeholder="3.0"
          />
        </div>
      )}

      {/* Issue Price */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
          Price per Share
        </label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={shareClass.originalIssuePriceInDollars}
          onChange={(e) => {
            const newPrice = parseFloat(e.target.value) || 0;
            if (shareClass.isHypothetical) {
              onUpdateInvestmentSize({ pricePerShare: newPrice });
            } else {
              onUpdate({ originalIssuePriceInDollars: newPrice });
            }
          }}
          className="h-9 text-sm"
          placeholder="$0.00"
        />
      </div>

      {/* Investment Size Controls (for hypothetical share classes) */}
      {shareClass.isHypothetical && holding && (
        <InvestmentSizeControls
          holding={holding}
          onUpdateInvestment={(totalCents) => 
            onUpdateInvestmentSize({ totalInvestmentCents: totalCents })
          }
          onUpdateShares={(shares) => 
            onUpdateInvestmentSize({ numberOfShares: shares })
          }
        />
      )}
      </div>
    </div>
  );
}