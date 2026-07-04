import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ArrowLeftRight, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import StockBadge from '@/components/layout/StockBadge';
import { useReactivos } from '@/hooks/useReactivos';
import { useAllMovimientos, calcularStock, getSemaforoColor } from '@/hooks/useMovimientos';
import { useCurrentProfile } from '@/hooks/useProfile';
import moment from 'moment';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>);

}

export default function Dashboard() {
  const { data: profile } = useCurrentProfile();
  const { data: reactivos, isLoading: loadingR } = useReactivos();
  const { data: movimientos, isLoading: loadingM } = useAllMovimientos(100);

  if (loadingR || loadingM) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
      </div>);

  }

  // Calculate stock per reactivo
  const stockMap = {};
  (movimientos || []).forEach((m) => {
    if (!stockMap[m.reactivo_id]) stockMap[m.reactivo_id] = [];
    stockMap[m.reactivo_id].push(m);
  });

  const reactivosConStock = (reactivos || []).map((r) => ({
    ...r,
    stock: calcularStock(stockMap[r.id])
  }));

  const total = reactivosConStock.length;
  const bajoMinimo = reactivosConStock.filter((r) => {
    const color = getSemaforoColor(r.stock, r.stock_minimo);
    return color === 'yellow';
  }).length;
  const agotados = reactivosConStock.filter((r) => r.stock <= 0).length;

  const ultimosMovimientos = (movimientos || []).slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${profile?.full_name || 'Usuario'}`}
        description="Panel de control de inventario de reactivos químicos" />
      

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FlaskConical} label="Total reactivos" value={total} color="bg-blue-100 text-blue-600" />
        <StatCard icon={AlertTriangle} label="Bajo mínimo" value={bajoMinimo} color="bg-amber-100 text-amber-600" />
        <StatCard icon={XCircle} label="Agotados" value={agotados} color="bg-red-100 text-red-600" />
      </div>

      {/* Latest movements */}
      <Card>
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-medium">Últimos movimientos</h2>
          </div>
          {ultimosMovimientos.length === 0 ?
          <div className="p-8 text-center text-sm text-muted-foreground">
              No hay movimientos registrados
            </div> :

          <div className="divide-y divide-border">
              {ultimosMovimientos.map((m) => {
              const reactivo = (reactivos || []).find((r) => r.id === m.reactivo_id);
              return (
                <div key={m.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {m.tipo === 'entrada' ?
                    <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" /> :

                    <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
                    }
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {reactivo?.nombre || 'Reactivo eliminado'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{m.motivo}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className={`text-sm font-medium ${m.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad} {reactivo?.unidad_medida || ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {moment(m.created_date).fromNow()}
                      </p>
                    </div>
                  </div>);

            })}
            </div>
          }
        </CardContent>
      </Card>
    </div>);

}