import React from 'react';
import { getActiveGhs } from '@/lib/ghs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function GhsBadges({ reactivo }) {
  const active = getActiveGhs(reactivo);
  if (!active.length) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <TooltipProvider>
      <div className="flex gap-1 flex-wrap">
        {active.map((p) => (
          <Tooltip key={p.key}>
            <TooltipTrigger>
              <span className="text-base cursor-default">{p.emoji}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{p.code} — {p.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}