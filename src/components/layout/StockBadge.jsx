import React from 'react';
import { getSemaforoColor } from '@/hooks/useMovimientos';

const COLORS = {
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
};

const LABELS = {
  green: 'Suficiente',
  yellow: 'Bajo mínimo',
  red: 'Agotado',
};

export default function StockBadge({ stock, stockMinimo }) {
  const color = getSemaforoColor(stock, stockMinimo);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${COLORS[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color === 'green' ? 'bg-emerald-500' : color === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {LABELS[color]}
    </span>
  );
}