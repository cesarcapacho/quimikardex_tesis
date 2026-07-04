import React from 'react';
import { GHS_PICTOGRAMS } from '@/lib/ghs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function GhsPicker({ values, onChange }) {
  const handleToggle = (key) => {
    onChange({ ...values, [key]: !values[key] });
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {GHS_PICTOGRAMS.map((p) => (
        <label
          key={p.key}
          className={`
            flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm
            ${values[p.key] 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-muted-foreground/30'}
          `}
        >
          <Checkbox 
            checked={!!values[p.key]} 
            onCheckedChange={() => handleToggle(p.key)} 
          />
          <span className="text-base">{p.emoji}</span>
          <span className="truncate text-xs">{p.label}</span>
        </label>
      ))}
    </div>
  );
}