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
      valuationCapCents: 1000000000, // $10M default
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
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Convertible Securities</h3>
          <Button
            size="small"
            variant="outline"
            onClick={handleAddConvertible}
            disabled={investors.length === 0}
          >
            <Plus className="size-4 mr-1" />
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
                className={`border rounded-lg ${
                  security.isHypothetical ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => toggleExpanded(security.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedSecurities.has(security.id) ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="font-medium">
                        {getSecurityTypeName(security)} - {getInvestorName(security.investorId)}
                      </div>
                    </div>

                    <Badge variant={security.isHypothetical ? "secondary" : "default"}>
                      {security.isHypothetical ? 'HYPO' : 'DB'}
                    </Badge>

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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Principal
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="10000"
                          value={security.principalValueInCents / 100}
                          onChange={(e) => updateConvertibleSecurity(security.id, { 
                            principalValueInCents: Math.round((parseFloat(e.target.value) || 0) * 100)
                          })}
                          className="text-right"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
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
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="100000"
                          value={security.valuationCapCents ? Number(security.valuationCapCents) / 100 : ''}
                          onChange={(e) => updateConvertibleSecurity(security.id, { 
                            valuationCapCents: e.target.value ? BigInt(Math.round((parseFloat(e.target.value) || 0) * 100)) : undefined
                          })}
                          placeholder="No cap"
                          className="text-right"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
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
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          value={security.discountRatePercent || ''}
                          onChange={(e) => updateConvertibleSecurity(security.id, { 
                            discountRatePercent: e.target.value ? parseFloat(e.target.value) : undefined
                          })}
                          placeholder="No discount"
                          className="text-right"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>

                    {/* Conversion Preview */}
                    <div className="bg-blue-50 rounded p-2">
                      <div className="flex items-center gap-1 text-xs font-medium text-blue-700 mb-1">
                        <Calculator className="size-3" />
                        Conversion Preview
                      </div>
                      <div className="text-xs text-blue-600">
                        ~{preview.shares.toLocaleString()} shares @ ${preview.pricePerShare.toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-600">
                        Total: {formatMoneyFromCents(preview.totalValue * 100)}
                      </div>
                    </div>
                  </div>

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
                                  onChange={(e) => updateConvertibleSecurity(security.id, { 
                                    interestRatePercent: e.target.value ? parseFloat(e.target.value) : undefined
                                  })}
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
                                onChange={(e) => updateConvertibleSecurity(security.id, { 
                                  maturityDate: e.target.value ? new Date(e.target.value) : undefined
                                })}
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
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm mb-2">No convertible securities configured</p>
              <p className="text-xs">
                {investors.length === 0 
                  ? 'Add investors first, then create convertibles'
                  : 'Click "Add" to create a SAFE or convertible note'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}