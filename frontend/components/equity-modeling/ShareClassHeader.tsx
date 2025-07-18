import React from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { PlaygroundShareClass } from '@/lib/equity-modeling/types';

interface ShareClassHeaderProps {
  shareClass: PlaygroundShareClass;
  onUpdateName: (name: string) => void;
  onRemove: () => void;
}

export default function ShareClassHeader({
  shareClass,
  onUpdateName,
  onRemove,
}: ShareClassHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Input
        value={shareClass.name}
        onChange={(e) => onUpdateName(e.target.value)}
        className="flex-1 text-sm font-medium border-gray-200 bg-white h-9"
        placeholder="Share class name"
      />

      {shareClass.isHypothetical && (
        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-red-50 rounded-md text-red-600 transition-colors"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}