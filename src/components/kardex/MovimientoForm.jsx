import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function MovimientoForm({ reactivoId, stockActual, unidad, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    tipo: 'entrada',
    cantidad: '',
    motivo: '',
    lote: '',
    proveedor: '',
    fecha_vencimiento: '',
    observaciones: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cantidad = Number(form.cantidad);
    if (!cantidad || cantidad <= 0) {
      toast({ title: 'La cantidad debe ser mayor a 0', variant: 'destructive' });
      return;
    }
    if (!form.motivo.trim()) {
      toast({ title: 'El motivo es obligatorio', variant: 'destructive' });
      return;
    }
    if (form.tipo === 'salida' && cantidad > stockActual) {
      toast({ 
        title: 'Stock insuficiente', 
        description: `Stock actual: ${stockActual} ${unidad}. No se pueden retirar ${cantidad} ${unidad}.`,
        variant: 'destructive' 
      });
      return;
    }
    onSubmit({ ...form, cantidad, reactivo_id: reactivoId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de movimiento *</Label>
          <Select value={form.tipo} onValueChange={(v) => set('tipo', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="salida">Salida</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Cantidad ({unidad}) *</Label>
          <Input type="number" min="0.01" step="0.01" value={form.cantidad} onChange={(e) => set('cantidad', e.target.value)} placeholder="0" />
          {form.tipo === 'salida' && (
            <p className="text-xs text-muted-foreground">Stock actual: {stockActual} {unidad}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Motivo *</Label>
          <Input value={form.motivo} onChange={(e) => set('motivo', e.target.value)} placeholder="Práctica de laboratorio" />
        </div>
        {form.tipo === 'entrada' && (
          <>
            <div className="space-y-2">
              <Label>Lote</Label>
              <Input value={form.lote} onChange={(e) => set('lote', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Input value={form.proveedor} onChange={(e) => set('proveedor', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha de vencimiento</Label>
              <Input type="date" value={form.fecha_vencimiento} onChange={(e) => set('fecha_vencimiento', e.target.value)} />
            </div>
          </>
        )}
      </div>
      <div className="space-y-2">
        <Label>Observaciones</Label>
        <Textarea value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} rows={2} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Registrar movimiento
        </Button>
      </div>
    </form>
  );
}