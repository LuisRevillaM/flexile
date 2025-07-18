import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayground } from '@/lib/equity-modeling/store';
import ShareClassSummaryRow from './ShareClassSummaryRow';
import ShareClassTermsGrid from './ShareClassTermsGrid';

interface ShareClassTermsPanelProps {
  className?: string;
}

export default function ShareClassTermsPanel({ className }: ShareClassTermsPanelProps) {
  const { 
    shareClasses, 
    shareHoldings, 
    updateShareClass, 
    updateShareHolding, 
    addShareClass, 
    removeShareClass 
  } = usePlayground();
  
  const [expandedShareClasses, setExpandedShareClasses] = useState<Set<string>>(new Set());

  const handleAddShareClass = () => {
    const newId = addShareClass({
      name: `Series ${String.fromCharCode(65 + shareClasses.filter(sc => sc.isHypothetical).length)}`,
      preferred: true,
      originalIssuePriceInDollars: 10.0,
      liquidationPreferenceMultiple: 1.0,
      participating: false,
      seniorityRank: Math.max(...shareClasses.map(sc => sc.seniorityRank), -1) + 1,
      isHypothetical: true,
    });
    
    // Auto-expand the new share class
    setExpandedShareClasses(new Set([...expandedShareClasses, newId]));
  };

  // Helper function to get hypothetical holdings for a share class
  const getHypotheticalHolding = (shareClassId: string) => {
    return shareHoldings.find(h => h.shareClassId === shareClassId && h.isHypothetical);
  };

  // Helper function to update investment size
  const updateInvestmentSize = (shareClassId: string, updates: { totalInvestmentCents?: number; numberOfShares?: number; pricePerShare?: number }) => {
    const holding = getHypotheticalHolding(shareClassId);
    if (!holding) return;

    let newShares = holding.numberOfShares;
    let newPrice = holding.sharePriceUsd;
    let newTotalCents = holding.totalAmountInCents;

    // Smart recalculation based on what was updated
    if (updates.totalInvestmentCents !== undefined && updates.pricePerShare !== undefined) {
      // Total investment and price changed - calculate shares
      newTotalCents = updates.totalInvestmentCents;
      newPrice = updates.pricePerShare;
      newShares = Math.round(newTotalCents / 100 / newPrice);
    } else if (updates.numberOfShares !== undefined && updates.pricePerShare !== undefined) {
      // Shares and price changed - calculate total investment
      newShares = updates.numberOfShares;
      newPrice = updates.pricePerShare;
      newTotalCents = Math.round(newShares * newPrice * 100);
    } else if (updates.totalInvestmentCents !== undefined && updates.numberOfShares !== undefined) {
      // Total investment and shares changed - calculate price
      newTotalCents = updates.totalInvestmentCents;
      newShares = updates.numberOfShares;
      newPrice = newShares > 0 ? newTotalCents / 100 / newShares : 0;
    } else if (updates.totalInvestmentCents !== undefined) {
      // Only total investment changed - keep price, calculate shares
      newTotalCents = updates.totalInvestmentCents;
      newShares = Math.round(newTotalCents / 100 / newPrice);
    } else if (updates.numberOfShares !== undefined) {
      // Only shares changed - keep price, calculate total investment
      newShares = updates.numberOfShares;
      newTotalCents = Math.round(newShares * newPrice * 100);
    } else if (updates.pricePerShare !== undefined) {
      // Only price changed - keep shares, calculate total investment
      newPrice = updates.pricePerShare;
      newTotalCents = Math.round(newShares * newPrice * 100);
    }

    // Update both share class and holdings
    updateShareClass(shareClassId, { originalIssuePriceInDollars: newPrice });
    updateShareHolding(holding.id, {
      numberOfShares: newShares,
      sharePriceUsd: newPrice,
      totalAmountInCents: newTotalCents,
    });
  };

  const toggleExpanded = (shareClassId: string) => {
    const newExpanded = new Set(expandedShareClasses);
    if (newExpanded.has(shareClassId)) {
      newExpanded.delete(shareClassId);
    } else {
      newExpanded.add(shareClassId);
    }
    setExpandedShareClasses(newExpanded);
  };

  // Sort share classes by seniority rank (lower number = higher priority)
  const sortedShareClasses = [...shareClasses].sort((a, b) => a.seniorityRank - b.seniorityRank);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-900">Share Classes</h3>
        <Button
          size="small"
          variant="ghost"
          onClick={handleAddShareClass}
          className="text-gray-600 hover:text-gray-900"
        >
          <Plus className="size-3.5 mr-1.5" />
          Add
        </Button>
      </div>

      {/* Share Classes List */}
      <div className="space-y-1">
        {sortedShareClasses.map((shareClass, index) => {
          const isExpanded = expandedShareClasses.has(shareClass.id);
          const holding = getHypotheticalHolding(shareClass.id);

          return (
            <div key={shareClass.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Summary Row */}
              <ShareClassSummaryRow
                shareClass={shareClass}
                holding={holding}
                index={index}
                isExpanded={isExpanded}
                onClick={() => toggleExpanded(shareClass.id)}
              />

              {/* Expanded Details */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                  {/* Terms Grid - No header needed, less is more */}
                  <ShareClassTermsGrid
                    shareClass={shareClass}
                    holding={holding}
                    onUpdate={(updates) => updateShareClass(shareClass.id, updates)}
                    onUpdateInvestmentSize={(updates) => updateInvestmentSize(shareClass.id, updates)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {shareClasses.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No share classes configured</p>
            <p className="text-xs mt-1">Click "Add" to create a share class</p>
          </div>
        )}
      </div>
    </div>
  );
}