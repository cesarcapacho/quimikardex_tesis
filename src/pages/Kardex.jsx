import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import StockBadge from '@/components/layout/StockBadge';
import MovimientoForm from '@/components/kardex/MovimientoForm';
import { useReactivos } from '@/hooks/useReactivos';
import { useAllMovimientos, useCreateMovimiento, useDeleteMovimiento, calcularStock } from '@/hooks/useMovimientos';
import { useIsProfesor } from '@/hooks/useProfile';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function Kardex() {
  const isProfesor = useIsProfesor();
  const { data: reactivos } = useReactivos();
  const { data: movimientos, isLoading } = useAllMovimientos(500);
  const createMov = useCreateMovimiento();
  const deleteMov = useDeleteMovimiento();
  const [search, setSearch] = useState('');
  const [selectedReactivo, setSelectedReactivo] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showReactivoPicker, setShowReactivoPicker] = useState(false);
  const [formReactivo, setFormReactivo] = useState(null);

  const stockMap = {};
  (movimientos || []).forEach((m) => {
    if (!stockMap[m.reactivo_id]) stockMap[m.reactivo_id] = [];
    stockMap[m.reactivo_id].push(m);
  });

  const filtered = (movimientos || []).filter((m) => {
    if (selectedReactivo !== 'all' && m.reactivo_id !== selectedReactivo) return false;
    if (search) {
      const r = (reactivos || []).find((r) => r.id === m.reactivo_id);
      const searchLower = search.toLowerCase();
      return r?.nombre.toLowerCase().includes(searchLower) ||
        m.responsable?.toLowerCase().includes(searchLower) ||
        m.motivo?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const openMovForm = (reactivo) => {
    setFormReactivo(reactivo);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    await createMov.mutateAsync(data);
    toast({ title: 'Movimiento registrado' });
    setShowForm(false);
    setFormReactivo(null);
  };

  const handleDelete = async (id) => {
    await deleteMov.mutateAsync(id);
    toast({ title: 'Movimiento eliminado' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kardex"
        description="Registro de movimientos de entrada y salida"
        actions={isProfesor && (
          <Button size="sm" onClick={() => setShowReactivoPicker(true)}>
            <Plus className="w-4 h-4 mr-1.5" />Nuevo movimiento
          </Button>
        )}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar movimientos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedReactivo} onValueChange={setSelectedReactivo}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Todos los reactivos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los reactivos</SelectItem>
            {(reactivos || []).map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground text-sm">
            No hay movimientos registrados
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reactivo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Cantidad</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Responsable</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Motivo</th>
                  {isProfesor && <th className="px-4 py-3" />}
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                  {filtered.map((m) => {
                  const r = (reactivos || []).find((r) => r.id === m.reactivo_id);
                  return (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {moment(m.created_date).format('DD/MM/YYYY HH:mm')}
                      </td>
                      <td className="px-4 py-3 font-medium">{r?.nombre || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          m.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        m.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad} {r?.unidad_medida || ''}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">{m.responsable}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{m.motivo}</td>
                      {isProfesor && (
                        <td className="px-4 py-3 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará el registro de {m.tipo} de {m.cantidad} {r?.unidad_medida || ''} del {moment(m.created_date).format('DD/MM/YYYY')}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(m.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      )}
                    </tr>
                  );
                  })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Pick reactivo dialog */}
      <Dialog open={showReactivoPicker} onOpenChange={setShowReactivoPicker}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Seleccionar reactivo</DialogTitle>
          </DialogHeader>
          <Select onValueChange={(id) => {
            const r = (reactivos || []).find((r) => r.id === id);
            if (r) { openMovForm(r); setShowReactivoPicker(false); }
          }}>
            <SelectTrigger><SelectValue placeholder="Seleccionar reactivo" /></SelectTrigger>
            <SelectContent>
              {(reactivos || []).map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>

      {/* Movement form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar movimiento — {formReactivo?.nombre}</DialogTitle>
          </DialogHeader>
          {formReactivo && (
            <MovimientoForm
              reactivoId={formReactivo.id}
              stockActual={calcularStock(stockMap[formReactivo.id])}
              unidad={formReactivo.unidad_medida}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setFormReactivo(null); }}
              loading={createMov.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}