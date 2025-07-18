import React from 'react';
import { Plus, HelpCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlayground } from '@/lib/equity-modeling/store';

interface ShareClassTermsPanelProps {
  className?: string;
}

export default function ShareClassTermsPanel({ className }: ShareClassTermsPanelProps) {
  const { shareClasses, updateShareClass, addShareClass, removeShareClass } = usePlayground();

  const handleAddShareClass = () => {
    addShareClass({
      name: `Series ${String.fromCharCode(65 + shareClasses.filter(sc => sc.isHypothetical).length)}`,
      preferred: true,
      originalIssuePriceInDollars: 10.0,
      liquidationPreferenceMultiple: 1.0,
      participating: false,
      seniorityRank: Math.max(...shareClasses.map(sc => sc.seniorityRank), -1) + 1,
      isHypothetical: true,
    });
  };


  // Sort share classes by seniority rank (lower number = higher priority)
  const sortedShareClasses = [...shareClasses].sort((a, b) => a.seniorityRank - b.seniorityRank);

  return (
    <Card className={className}>
      <div className={className?.includes('p-0') ? '' : 'p-6'}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share Classes</h3>
          <Button
            size="small"
            variant="outline"
            onClick={handleAddShareClass}
          >
            <Plus className="size-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-4">
          {sortedShareClasses.map((shareClass, index) => (
            <div
              key={shareClass.id}
              className={`border rounded-lg p-4 ${
                shareClass.isHypothetical ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-200'
              }`}
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center gap-2">
                  <Input
                    value={shareClass.name}
                    onChange={(e) => updateShareClass(shareClass.id, { name: e.target.value })}
                    className="flex-1 font-medium"
                  />

                  <Badge variant={shareClass.isHypothetical ? "secondary" : "default"}>
                    {shareClass.isHypothetical ? 'HYPO' : 'DB'}
                  </Badge>

                  {shareClass.isHypothetical && (
                    <button
                      onClick={() => removeShareClass(shareClass.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Terms Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                      Liquidation Pref
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="size-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Liquidation Preference</p>
                            <p className="text-sm">The multiple of invested capital returned before common shareholders.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={shareClass.liquidationPreferenceMultiple}
                        onChange={(e) => updateShareClass(shareClass.id, { 
                          liquidationPreferenceMultiple: parseFloat(e.target.value) || 0 
                        })}
                        className="text-right text-sm"
                      />
                      <span className="text-xs text-gray-500">x</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                      Participation
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="size-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Participation Rights</p>
                            <p className="text-sm">After liquidation preference, does this class participate in remaining proceeds?</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <Select
                      value={shareClass.participating ? (shareClass.participationCapMultiple ? 'capped' : 'full') : 'none'}
                      onValueChange={(value) => {
                        if (value === 'none') {
                          updateShareClass(shareClass.id, { participating: false });
                          // @ts-ignore - TypeScript doesn't handle partial updates with undefined well
                          updateShareClass(shareClass.id, { participationCapMultiple: undefined });
                        } else if (value === 'capped') {
                          updateShareClass(shareClass.id, { 
                            participating: true,
                            participationCapMultiple: 3.0 
                          });
                        } else {
                          updateShareClass(shareClass.id, { participating: true });
                          // @ts-ignore - TypeScript doesn't handle partial updates with undefined well  
                          updateShareClass(shareClass.id, { participationCapMultiple: undefined });
                        }
                      }}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="capped">Capped</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {shareClass.participating && shareClass.participationCapMultiple !== undefined && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Cap Multiple
                      </label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={shareClass.participationCapMultiple}
                          onChange={(e) => updateShareClass(shareClass.id, { 
                            participationCapMultiple: parseFloat(e.target.value) || 0 
                          })}
                          className="text-right text-sm"
                        />
                        <span className="text-xs text-gray-500">x</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Seniority
                    </label>
                    <div className="text-lg font-bold text-gray-800">#{index + 1}</div>
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Issue Price
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={shareClass.originalIssuePriceInDollars}
                        onChange={(e) => updateShareClass(shareClass.id, { 
                          originalIssuePriceInDollars: parseFloat(e.target.value) || 0 
                        })}
                        className="text-right text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Type
                    </label>
                    <Select
                      value={shareClass.preferred ? 'preferred' : 'common'}
                      onValueChange={(value) => updateShareClass(shareClass.id, { 
                        preferred: value === 'preferred' 
                      })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {shareClasses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm mb-2">No share classes configured</p>
              <p className="text-xs">Click "Add" to create a share class</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}