import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, HelpCircle, X, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlayground } from '@/lib/equity-modeling/store';
import { formatMoneyFromCents } from '@/utils/formatMoney';
import type { PlaygroundConvertibleSecurity } from '@/lib/equity-modeling/types';

interface ConvertibleTermsPanelProps {
  className?: string;
}

export default function ConvertibleTermsPanel({ className }: ConvertibleTermsPanelProps) {
  const { 
    convertibleSecurities, 
    investors,
    scenario,
    updateConvertibleSecurity, 
    addConvertibleSecurity, 
    removeConvertibleSecurity 
  } = usePlayground();
  const [expandedSecurities, setExpandedSecurities] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSecurities);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSecurities(newExpanded);
  };

  const handleAddConvertible = () => {
    const firstInvestor = investors[0];
    if (!firstInvestor) {
      alert('Please add an investor first');
      return;
    }

    const newId = addConvertibleSecurity({
      investorId: firstInvestor.id,
      principalValueInCents: 100000000, // $1M default
      issuedAt: new Date(),
      impliedShares: 100000, // Will be recalculated
      valuationCapCents: BigInt(1000000000), // $10M default
      discountRatePercent: 20,
      isHypothetical: true,
    });
    
    // Auto-expand the new convertible
    setExpandedSecurities(new Set([...expandedSecurities, newId]));
  };

  const calculateConversionPreview = (security: PlaygroundConvertibleSecurity) => {
    const exitValue = Number(scenario.exitAmountCents) / 100;
    const principal = security.principalValueInCents / 100;
    
    let conversionPrice = 0;
    let conversionShares = 0;
    
    if (security.valuationCapCents && security.discountRatePercent) {
      // Both cap and discount - use the better price
      const capPrice = Number(security.valuationCapCents) / 100;
      const discountPrice = exitValue * (1 - security.discountRatePercent / 100);
      conversionPrice = Math.min(capPrice, discountPrice);
    } else if (security.valuationCapCents) {
      // Only cap
      conversionPrice = Number(security.valuationCapCents) / 100;
    } else if (security.discountRatePercent) {
      // Only discount
      conversionPrice = exitValue * (1 - security.discountRatePercent / 100);
    } else {
      // No cap or discount - convert at exit valuation
      conversionPrice = exitValue;
    }
    
    // Add interest if it's a note
    let totalToConvert = principal;
    if (security.interestRatePercent && security.maturityDate) {
      const years = (new Date().getTime() - security.issuedAt.getTime()) / (365 * 24 * 60 * 60 * 1000);
      const interest = principal * (security.interestRatePercent / 100) * years;
      totalToConvert += interest;
    }
    
    // Rough share calculation (would need total shares for accurate calculation)
    const assumedTotalShares = 10000000; // Placeholder
    conversionShares = Math.floor((totalToConvert / conversionPrice) * assumedTotalShares);
    const pricePerShare = conversionPrice / assumedTotalShares;
    
    return {
      shares: conversionShares,
      pricePerShare: pricePerShare,
      totalValue: totalToConvert,
    };
  };

  const getInvestorName = (investorId: string) => {
    const investor = investors.find(inv => inv.id === investorId);
    return investor?.name || 'Unknown Investor';
  };

  const getSecurityTypeName = (security: PlaygroundConvertibleSecurity) => {
    if (security.interestRatePercent !== undefined) {
      return 'Convertible Note';
    }
    return 'SAFE';
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Convertible Securities</h3>
        <Button
          size="small"
          variant="ghost"
          onClick={handleAddConvertible}
          disabled={investors.length === 0}
          className="text-gray-600 hover:text-gray-900 disabled:text-gray-400"
        >
          <Plus className="size-3.5 mr-1" />
          Add
        </Button>
      </div>

        <div className="space-y-3">
          {convertibleSecurities.map((security) => {
            const preview = calculateConversionPreview(security);
            const isNote = security.interestRatePercent !== undefined;
            
            return (
              <div
                key={security.id}
                className={`rounded-lg ${
                  security.isHypothetical ? 'bg-gray-50' : 'bg-gray-50/50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getSecurityTypeName(security)}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">
                        {getInvestorName(security.investorId)}
                      </span>
                    </div>

                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      security.isHypothetical ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-white'
                    }`}>
                      {security.isHypothetical ? 'HYPO' : 'DB'}
                    </span>

                    {security.isHypothetical && (
                      <button
                        onClick={() => removeConvertibleSecurity(security.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Basic Terms - Always Visible */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Principal Amount
                      </label>
                      <Input
                          type="number"
                          min="0"
                          step="10000"
                          value={security.principalValueInCents / 100}
                          onChange={(e) => updateConvertibleSecurity(security.id, { 
                            principalValueInCents: Math.round((parseFloat(e.target.value) || 0) * 100)
                          })}
                          className="text-sm"
                          placeholder="$0"
                        />
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
                        Valuation Cap
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="size-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">Valuation Cap</p>
                              <p className="text-sm">The maximum valuation at which the convertible will convert to equity, protecting early investors from dilution.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                          type="number"
                          min="0"
                          step="100000"
                          value={security.valuationCapCents ? Number(security.valuationCapCents) / 100 : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              updateConvertibleSecurity(security.id, { 
                                valuationCapCents: BigInt(Math.round((parseFloat(e.target.value) || 0) * 100))
                              });
                            } else {
                              // @ts-ignore - TypeScript doesn't handle partial updates with undefined well
                              updateConvertibleSecurity(security.id, { valuationCapCents: undefined });
                            }
                          }}
                          placeholder="No cap"
                          className="text-sm"
                        />
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
                        Discount Rate
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="size-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">Discount Rate</p>
                              <p className="text-sm">The percentage discount applied to the next round's price when converting to equity.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          value={security.discountRatePercent || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              updateConvertibleSecurity(security.id, { 
                                discountRatePercent: parseFloat(e.target.value)
                              });
                            } else {
                              // @ts-ignore - TypeScript doesn't handle partial updates with undefined well
                              updateConvertibleSecurity(security.id, { discountRatePercent: undefined });
                            }
                          }}
                          placeholder="0%"
                          className="text-sm"
                        />
                    </div>

                    {/* Conversion Preview */}
                    <div className="bg-gray-100 rounded-md p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
                        <Calculator className="size-3" />
                        <span>Conversion Preview</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <div>~{preview.shares.toLocaleString()} shares</div>
                        <div>{formatMoneyFromCents(preview.totalValue * 100)} total value</div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Terms Toggle */}
                  <button
                    onClick={() => toggleExpanded(security.id)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {expandedSecurities.has(security.id) ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronRight className="size-3" />
                    )}
                    <span>
                      {expandedSecurities.has(security.id) ? 'Hide' : 'Show'} advanced options
                    </span>
                  </button>

                  {/* Expanded Terms */}
                  {expandedSecurities.has(security.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Type
                          </label>
                          <Select
                            value={isNote ? 'note' : 'safe'}
                            onValueChange={(value) => {
                              if (value === 'note') {
                                updateConvertibleSecurity(security.id, { 
                                  interestRatePercent: 6,
                                  maturityDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
                                });
                              } else {
                                // @ts-ignore - TypeScript doesn't handle partial updates with undefined well
                                updateConvertibleSecurity(security.id, { 
                                  interestRatePercent: undefined,
                                  maturityDate: undefined,
                                });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="safe">SAFE</SelectItem>
                              <SelectItem value="note">Convertible Note</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Investor
                          </label>
                          <Select
                            value={security.investorId}
                            onValueChange={(value) => updateConvertibleSecurity(security.id, { investorId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {investors.map(investor => (
                                <SelectItem key={investor.id} value={investor.id}>
                                  {investor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {isNote && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Interest Rate
                              </label>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.5"
                                  value={security.interestRatePercent || ''}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      updateConvertibleSecurity(security.id, { 
                                        interestRatePercent: parseFloat(e.target.value)
                                      });
                                    } else {
                                      // @ts-ignore - TypeScript doesn't handle partial updates with undefined well
                                      updateConvertibleSecurity(security.id, { interestRatePercent: undefined });
                                    }
                                  }}
                                  className="text-right"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Maturity Date
                              </label>
                              <Input
                                type="date"
                                value={security.maturityDate ? security.maturityDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateConvertibleSecurity(security.id, { 
                                      maturityDate: new Date(e.target.value)
                                    });
                                  } else {
                                    // @ts-ignore - TypeScript doesn't handle partial updates with undefined well
                                    updateConvertibleSecurity(security.id, { maturityDate: undefined });
                                  }
                                }}
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Issued Date
                          </label>
                          <Input
                            type="date"
                            value={security.issuedAt.toISOString().split('T')[0]}
                            onChange={(e) => updateConvertibleSecurity(security.id, { 
                              issuedAt: new Date(e.target.value)
                            })}
                          />
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Additional terms (seniority, conversion triggers, etc.) coming soon...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {convertibleSecurities.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No convertible securities configured</p>
              <p className="text-xs mt-1">
                {investors.length === 0 
                  ? 'Add investors first, then create convertibles'
                  : 'Click "Add" to create a SAFE or convertible note'
                }
              </p>
            </div>
          )}
        </div>
    </div>
  );
}