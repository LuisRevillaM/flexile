import React from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PlaygroundConvertibleSecurity } from '@/lib/equity-modeling/types';

interface ConvertibleTermsGridProps {
  security: PlaygroundConvertibleSecurity;
  onUpdate: (updates: Partial<PlaygroundConvertibleSecurity>) => void;
  onRemove?: () => void;
}

export default function ConvertibleTermsGrid({
  security,
  onUpdate,
  onRemove,
}: ConvertibleTermsGridProps) {
  const isNote = security.interestRatePercent !== undefined;

  return (
    <div className="space-y-4">
      {/* Delete button for hypothetical convertibles */}
      {security.isHypothetical && onRemove && (
        <div className="flex justify-end">
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
      {/* Principal Amount */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Principal Amount
        </label>
        <Input
          type="number"
          min="0"
          step="10000"
          value={security.principalValueInCents / 100}
          onChange={(e) => onUpdate({
            principalValueInCents: Math.round((parseFloat(e.target.value) || 0) * 100)
          })}
          className="h-9 text-sm"
          placeholder="$0"
        />
      </div>

      {/* Valuation Cap */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Valuation Cap
        </label>
        <Input
          type="number"
          min="0"
          step="100000"
          value={security.valuationCapCents ? Number(security.valuationCapCents) / 100 : ''}
          onChange={(e) => {
            if (e.target.value) {
              onUpdate({
                valuationCapCents: BigInt(Math.round((parseFloat(e.target.value) || 0) * 100))
              });
            } else {
              onUpdate({ valuationCapCents: undefined });
            }
          }}
          placeholder="No cap"
          className="h-9 text-sm"
        />
      </div>

      {/* Discount Rate */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Discount %
        </label>
        <Input
          type="number"
          min="0"
          max="100"
          step="5"
          value={security.discountRatePercent || ''}
          onChange={(e) => {
            if (e.target.value) {
              onUpdate({
                discountRatePercent: parseFloat(e.target.value)
              });
            } else {
              onUpdate({ discountRatePercent: undefined });
            }
          }}
          placeholder="0"
          className="h-9 text-sm"
        />
      </div>

      {/* Type Selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Type
        </label>
        <Select
          value={isNote ? 'note' : 'safe'}
          onValueChange={(value) => {
            if (value === 'note') {
              onUpdate({
                interestRatePercent: 6,
                maturityDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
              });
            } else {
              onUpdate({
                interestRatePercent: undefined,
                maturityDate: undefined,
              });
            }
          }}
        >
          <SelectTrigger className="h-9 text-sm w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="safe">SAFE</SelectItem>
            <SelectItem value="note">Convertible Note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interest Rate (for Notes) */}
      {isNote && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Interest %
          </label>
          <Input
            type="number"
            min="0"
            max="20"
            step="0.5"
            value={security.interestRatePercent || ''}
            onChange={(e) => {
              if (e.target.value) {
                onUpdate({
                  interestRatePercent: parseFloat(e.target.value)
                });
              } else {
                onUpdate({ interestRatePercent: undefined });
              }
            }}
            className="h-9 text-sm"
            placeholder="0"
          />
        </div>
      )}
      </div>
    </div>
  );
}