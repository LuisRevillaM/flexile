import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayground } from '@/lib/equity-modeling/store';
import ConvertibleSummaryRow from './ConvertibleSummaryRow';
import ConvertibleTermsGrid from './ConvertibleTermsGrid';

interface ConvertibleTermsPanelProps {
  className?: string;
}

export default function ConvertibleTermsPanel({ className }: ConvertibleTermsPanelProps) {
  const {
    convertibleSecurities,
    investors,
    updateConvertibleSecurity,
    addConvertibleSecurity,
    removeConvertibleSecurity,
    addInvestor,
  } = usePlayground();
  
  const [expandedConvertibles, setExpandedConvertibles] = useState<Set<string>>(new Set());

  const handleAddConvertible = () => {
    // Create a hypothetical investor for the convertible
    const existingConvertibleCount = convertibleSecurities.filter(c => c.isHypothetical).length;
    const hypotheticalInvestorName = `SAFE Investor ${existingConvertibleCount + 1}`;

    // First, add the hypothetical investor
    const investorId = addInvestor({
      name: hypotheticalInvestorName,
      type: 'entity',
      isHypothetical: true,
      createdAt: new Date(),
    });

    const newId = addConvertibleSecurity({
      investorId: investorId,
      principalValueInCents: 100000000, // $1M default
      issuedAt: new Date(),
      impliedShares: 100000, // Will be recalculated
      valuationCapCents: BigInt(1000000000), // $10M default
      discountRatePercent: 20,
      isHypothetical: true,
    });

    // Auto-expand the new convertible
    setExpandedConvertibles(new Set([...expandedConvertibles, newId]));
  };

  const getInvestorName = (investorId: string) => {
    const investor = investors.find(inv => inv.id === investorId);
    return investor?.name || 'Unknown Investor';
  };

  const toggleExpanded = (securityId: string) => {
    const newExpanded = new Set(expandedConvertibles);
    if (newExpanded.has(securityId)) {
      newExpanded.delete(securityId);
    } else {
      newExpanded.add(securityId);
    }
    setExpandedConvertibles(newExpanded);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-900">Convertible Securities</h3>
        <Button
          size="small"
          variant="ghost"
          onClick={handleAddConvertible}
          className="text-gray-600 hover:text-gray-900"
        >
          <Plus className="size-3.5 mr-1.5" />
          Add
        </Button>
      </div>

      {/* Convertibles List */}
      <div className="space-y-1">
        {convertibleSecurities.map(security => {
          const isExpanded = expandedConvertibles.has(security.id);
          
          return (
            <div key={security.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Summary Row */}
              <ConvertibleSummaryRow
                security={security}
                investorName={getInvestorName(security.investorId)}
                isExpanded={isExpanded}
                onClick={() => toggleExpanded(security.id)}
              />

              {/* Expanded Details */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                  <ConvertibleTermsGrid
                    security={security}
                    onUpdate={(updates) => updateConvertibleSecurity(security.id, updates)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {convertibleSecurities.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No convertible securities configured</p>
            <p className="text-xs mt-1">Click "Add" to create a SAFE or convertible note</p>
          </div>
        )}
      </div>
    </div>
  );
}