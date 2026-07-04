import React, { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';
import { useReactivos } from '@/hooks/useReactivos';
import { useAllMovimientos, calcularStock, getSemaforoColor } from '@/hooks/useMovimientos';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import moment from 'moment';

const SEMAFORO_LABELS = { green: 'Suficiente', yellow: 'Bajo mínimo', red: 'Agotado' };

export default function Reportes() {
  const { data: reactivos } = useReactivos();
  const { data: movimientos } = useAllMovimientos(1000);
  const [selectedReactivo, setSelectedReactivo] = useState('');
  const [generating, setGenerating] = useState('');

  const stockMap = {};
  (movimientos || []).forEach((m) => {
    if (!stockMap[m.reactivo_id]) stockMap[m.reactivo_id] = [];
    stockMap[m.reactivo_id].push(m);
  });

  const generarInventarioPDF = () => {
    setGenerating('inventario');
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('QUIMIKARDEX — Inventario General', 14, 20);
      doc.setFontSize(8);
      doc.text(`Generado: ${moment().format('DD/MM/YYYY HH:mm')}`, 14, 27);

      let y = 35;
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('Reactivo', 14, y);
      doc.text('CAS', 70, y);
      doc.text('Stock', 110, y);
      doc.text('Unidad', 135, y);
      doc.text('Estado', 160, y);
      doc.setFont(undefined, 'normal');
      y += 2;
      doc.line(14, y, 196, y);
      y += 5;

      (reactivos || []).forEach((r) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const stock = calcularStock(stockMap[r.id]);
        const estado = SEMAFORO_LABELS[getSemaforoColor(stock, r.stock_minimo)];
        doc.text(r.nombre.substring(0, 30), 14, y);
        doc.text(r.cas || '—', 70, y);
        doc.text(String(stock), 110, y);
        doc.text(r.unidad_medida, 135, y);
        doc.text(estado, 160, y);
        y += 6;
      });

      doc.save('inventario-quimikardex.pdf');
      toast({ title: 'PDF de inventario generado' });
    } finally {
      setGenerating('');
    }
  };

  const generarKardexPDF = () => {
    if (!selectedReactivo) {
      toast({ title: 'Selecciona un reactivo', variant: 'destructive' });
      return;
    }
    setGenerating('kardex');
    try {
      const reactivo = (reactivos || []).find((r) => r.id === selectedReactivo);
      const movs = (stockMap[selectedReactivo] || []).sort(
        (a, b) => new Date(a.created_date) - new Date(b.created_date)
      );
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Kardex — ${reactivo?.nombre || 'Reactivo'}`, 14, 20);
      doc.setFontSize(8);
      doc.text(`CAS: ${reactivo?.cas || '—'} | Unidad: ${reactivo?.unidad_medida || ''}`, 14, 27);
      doc.text(`Generado: ${moment().format('DD/MM/YYYY HH:mm')}`, 14, 33);

      let y = 42;
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('Fecha', 14, y);
      doc.text('Tipo', 55, y);
      doc.text('Cantidad', 80, y);
      doc.text('Saldo', 105, y);
      doc.text('Responsable', 125, y);
      doc.text('Motivo', 165, y);
      doc.setFont(undefined, 'normal');
      y += 2;
      doc.line(14, y, 196, y);
      y += 5;

      let saldo = 0;
      movs.forEach((m) => {
        if (y > 275) { doc.addPage(); y = 20; }
        saldo += m.tipo === 'entrada' ? m.cantidad : -m.cantidad;
        doc.text(moment(m.created_date).format('DD/MM/YY HH:mm'), 14, y);
        doc.text(m.tipo === 'entrada' ? 'Entrada' : 'Salida', 55, y);
        doc.text(`${m.tipo === 'entrada' ? '+' : '-'}${m.cantidad}`, 80, y);
        doc.text(String(saldo), 105, y);
        doc.text((m.responsable || '').substring(0, 20), 125, y);
        doc.text((m.motivo || '').substring(0, 20), 165, y);
        y += 6;
      });

      doc.save(`kardex-${reactivo?.nombre || 'reactivo'}.pdf`);
      toast({ title: 'PDF de kardex generado' });
    } finally {
      setGenerating('');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" description="Genera reportes en PDF del inventario y kardex" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventario completo */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Inventario completo</h3>
                <p className="text-xs text-muted-foreground">Lista de todos los reactivos con stock y estado</p>
              </div>
            </div>
            <Button onClick={generarInventarioPDF} disabled={generating === 'inventario'} className="w-full">
              {generating === 'inventario' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generando...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Descargar PDF</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Kardex por reactivo */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Kardex por reactivo</h3>
                <p className="text-xs text-muted-foreground">Historial completo de movimientos</p>
              </div>
            </div>
            <Select value={selectedReactivo} onValueChange={setSelectedReactivo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar reactivo" />
              </SelectTrigger>
              <SelectContent>
                {(reactivos || []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generarKardexPDF} disabled={generating === 'kardex' || !selectedReactivo} className="w-full">
              {generating === 'kardex' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generando...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Descargar PDF</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}