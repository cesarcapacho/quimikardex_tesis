import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

const UNIDADES = ['g', 'kg', 'mL', 'L', 'unidad'];
const ESTADOS = ['sólido', 'líquido', 'gaseoso'];

const EMPTY = {
  nombre: '', cas: '', formula: '', unidad_medida: 'mL', stock_minimo: 0,
  ubicacion: '', marca: '', concentracion: '', estado_fisico: 'líquido',
  ghs_explosivo: false, ghs_inflamable: false, ghs_comburente: false,
  ghs_gas_presion: false, ghs_corrosivo: false, ghs_toxico: false,
  ghs_irritante: false, ghs_peligro_salud: false, ghs_medio_ambiente: false,
  fds_url: '', observaciones: '',
};

export default function ReactivoForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [uploading, setUploading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleFds = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('fds_url', file_url);
      toast({ title: 'FDS subida correctamente' });
    } catch {
      toast({ title: 'Error al subir FDS', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast({ title: 'El nombre es obligatorio', variant: 'destructive' });
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre *</Label>
          <Input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ácido clorhídrico" />
        </div>
        <div className="space-y-2">
          <Label>Número CAS</Label>
          <Input value={form.cas} onChange={(e) => set('cas', e.target.value)} placeholder="7647-01-0" />
        </div>
        <div className="space-y-2">
          <Label>Fórmula</Label>
          <Input value={form.formula} onChange={(e) => set('formula', e.target.value)} placeholder="HCl" />
        </div>
        <div className="space-y-2">
          <Label>Marca</Label>
          <Input value={form.marca} onChange={(e) => set('marca', e.target.value)} placeholder="Merck" />
        </div>
        <div className="space-y-2">
          <Label>Concentración</Label>
          <Input value={form.concentracion} onChange={(e) => set('concentracion', e.target.value)} placeholder="37%" />
        </div>
        <div className="space-y-2">
          <Label>Ubicación</Label>
          <Input value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)} placeholder="Estante A-3" />
        </div>
        <div className="space-y-2">
          <Label>Unidad de medida</Label>
          <Select value={form.unidad_medida} onValueChange={(v) => set('unidad_medida', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estado físico</Label>
          <Select value={form.estado_fisico} onValueChange={(v) => set('estado_fisico', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stock mínimo</Label>
          <Input type="number" min="0" value={form.stock_minimo} onChange={(e) => set('stock_minimo', Number(e.target.value))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ficha de Datos de Seguridad (FDS)</Label>
        <div className="flex items-center gap-3">
          <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFds} disabled={uploading} />
          {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
        {form.fds_url && (
          <a href={form.fds_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
            Ver FDS actual
          </a>
        )}
      </div>

      <div className="space-y-2">
        <Label>Observaciones</Label>
        <Textarea value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} rows={3} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initial ? 'Guardar cambios' : 'Crear reactivo'}
        </Button>
      </div>
    </form>
  );
}