import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, HelpCircle, GripVertical, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlayground } from '@/lib/equity-modeling/store';
import type { PlaygroundShareClass } from '@/lib/equity-modeling/types';

interface ShareClassTermsPanelProps {
  className?: string;
}

export default function ShareClassTermsPanel({ className }: ShareClassTermsPanelProps) {
  const { shareClasses, updateShareClass, addShareClass, removeShareClass } = usePlayground();
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [draggedClassId, setDraggedClassId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedClasses(newExpanded);
  };

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
    setExpandedClasses(new Set([...expandedClasses, newId]));
  };

  const handleDragStart = (e: React.DragEvent, classId: string) => {
    setDraggedClassId(classId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetClassId: string) => {
    e.preventDefault();
    if (!draggedClassId || draggedClassId === targetClassId) return;

    const draggedClass = shareClasses.find(sc => sc.id === draggedClassId);
    const targetClass = shareClasses.find(sc => sc.id === targetClassId);
    
    if (draggedClass && targetClass) {
      // Swap seniority ranks
      updateShareClass(draggedClassId, { seniorityRank: targetClass.seniorityRank });
      updateShareClass(targetClassId, { seniorityRank: draggedClass.seniorityRank });
    }
    
    setDraggedClassId(null);
  };

  // Sort share classes by seniority rank (lower number = higher priority)
  const sortedShareClasses = [...shareClasses].sort((a, b) => a.seniorityRank - b.seniorityRank);

  return (
    <Card className={className}>
      <div className="p-6">
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

        <div className="space-y-3">
          {sortedShareClasses.map((shareClass, index) => (
            <div
              key={shareClass.id}
              className={`border rounded-lg ${
                shareClass.isHypothetical ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-200'
              } ${draggedClassId === shareClass.id ? 'opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, shareClass.id)}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => toggleExpanded(shareClass.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedClasses.has(shareClass.id) ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>
                  
                  <div
                    className="cursor-move p-1 hover:bg-gray-100 rounded"
                    draggable
                    onDragStart={(e) => handleDragStart(e, shareClass.id)}
                    title="Drag to reorder seniority"
                  >
                    <GripVertical className="size-4 text-gray-500" />
                  </div>

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

                {/* Basic Terms - Always Visible */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                      Liquidation Pref
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="size-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Liquidation Preference Multiple</p>
                            <p className="text-sm">The multiple of invested capital that must be returned before common stockholders receive proceeds.</p>
                            <div className="mt-2 text-sm">
                              <div>1x = Return original investment first</div>
                              <div>2x = Return 2× investment first</div>
                            </div>
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
                        className="text-right"
                      />
                      <span className="text-sm text-gray-500">x</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                      Participation
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="size-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Participation Rights</p>
                            <p className="text-sm mb-2">After receiving liquidation preference, does this class participate in remaining proceeds?</p>
                            <div className="text-sm space-y-1">
                              <div><strong>None:</strong> No additional proceeds</div>
                              <div><strong>Capped:</strong> Participate up to a cap</div>
                              <div><strong>Full:</strong> Participate without limit</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <Select
                      value={shareClass.participating ? (shareClass.participationCapMultiple ? 'capped' : 'full') : 'none'}
                      onValueChange={(value) => {
                        if (value === 'none') {
                          updateShareClass(shareClass.id, { 
                            participating: false,
                            participationCapMultiple: undefined 
                          });
                        } else if (value === 'capped') {
                          updateShareClass(shareClass.id, { 
                            participating: true,
                            participationCapMultiple: 3.0 
                          });
                        } else {
                          updateShareClass(shareClass.id, { 
                            participating: true,
                            participationCapMultiple: undefined 
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="capped">Capped</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Seniority
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">#{index + 1}</span>
                      <span className="text-sm text-gray-500">in preference stack</span>
                    </div>
                  </div>
                </div>

                {/* Participation Cap - Only show if capped participation */}
                {shareClass.participating && shareClass.participationCapMultiple !== undefined && (
                  <div className="mt-3 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">└─ Cap Multiple:</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={shareClass.participationCapMultiple}
                        onChange={(e) => updateShareClass(shareClass.id, { 
                          participationCapMultiple: parseFloat(e.target.value) || 0 
                        })}
                        className="w-20 text-right"
                      />
                      <span className="text-sm text-gray-500">x</span>
                    </div>
                  </div>
                )}

                {/* Advanced Terms Toggle */}
                <button
                  onClick={() => toggleExpanded(shareClass.id)}
                  className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  {expandedClasses.has(shareClass.id) ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                  <span className="font-medium">
                    {expandedClasses.has(shareClass.id) ? 'Hide' : 'Show'} Advanced Terms
                  </span>
                  <span className="text-gray-500">(Issue Price, Share Type)</span>
                </button>

                {/* Advanced Terms - Expandable */}
                {expandedClasses.has(shareClass.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          Original Issue Price
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={shareClass.originalIssuePriceInDollars}
                            onChange={(e) => updateShareClass(shareClass.id, { 
                              originalIssuePriceInDollars: parseFloat(e.target.value) || 0 
                            })}
                            className="text-right"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          Share Type
                        </label>
                        <Select
                          value={shareClass.preferred ? 'preferred' : 'common'}
                          onValueChange={(value) => updateShareClass(shareClass.id, { 
                            preferred: value === 'preferred' 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="common">Common</SelectItem>
                            <SelectItem value="preferred">Preferred</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Additional advanced terms (dividends, anti-dilution, etc.) coming soon...
                    </div>
                  </div>
                )}
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