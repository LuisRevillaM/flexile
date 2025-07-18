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
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Share Classes</h3>
        <Button
          size="small"
          variant="ghost"
          onClick={handleAddShareClass}
          className="text-gray-600 hover:text-gray-900"
        >
          <Plus className="size-3.5 mr-1" />
          Add
        </Button>
      </div>

        <div className="space-y-4">
          {sortedShareClasses.map((shareClass, index) => (
            <div
              key={shareClass.id}
              className={`p-4 rounded-lg ${
                shareClass.isHypothetical ? 'bg-gray-50' : 'bg-gray-50/50'
              }`}
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    value={shareClass.name}
                    onChange={(e) => updateShareClass(shareClass.id, { name: e.target.value })}
                    className="flex-1 font-medium border-0 bg-white"
                    placeholder="Share class name"
                  />

                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    shareClass.isHypothetical ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-white'
                  }`}>
                    {shareClass.isHypothetical ? 'HYPO' : 'DB'}
                  </span>

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
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
                      Liquidation Preference
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
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={shareClass.liquidationPreferenceMultiple}
                      onChange={(e) => updateShareClass(shareClass.id, { 
                        liquidationPreferenceMultiple: parseFloat(e.target.value) || 0 
                      })}
                      className="text-sm"
                      placeholder="1.0"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
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
                      <SelectTrigger className="text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Non-participating</SelectItem>
                        <SelectItem value="capped">Capped participation</SelectItem>
                        <SelectItem value="full">Full participation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {shareClass.participating && shareClass.participationCapMultiple !== undefined && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Participation Cap
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={shareClass.participationCapMultiple}
                        onChange={(e) => updateShareClass(shareClass.id, { 
                          participationCapMultiple: parseFloat(e.target.value) || 0 
                        })}
                        className="text-sm"
                        placeholder="3.0"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Type
                    </label>
                    <Select
                      value={shareClass.preferred ? 'preferred' : 'common'}
                      onValueChange={(value) => updateShareClass(shareClass.id, { 
                        preferred: value === 'preferred' 
                      })}
                    >
                      <SelectTrigger className="text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Issue Price
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shareClass.originalIssuePriceInDollars}
                      onChange={(e) => updateShareClass(shareClass.id, { 
                        originalIssuePriceInDollars: parseFloat(e.target.value) || 0 
                      })}
                      className="text-sm"
                      placeholder="$0.00"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Seniority Rank
                    </label>
                    <div className="text-sm font-semibold text-gray-700 bg-gray-100 rounded px-3 py-1.5 text-center">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

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