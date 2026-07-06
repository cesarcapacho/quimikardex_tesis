import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, FileText, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import StockBadge from '@/components/layout/StockBadge';
import MovimientoForm from '@/components/kardex/MovimientoForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useReactivo } from '@/hooks/useReactivos';
import { useMovimientos, useCreateMovimiento, useDeleteMovimiento,calcularStock } from '@/hooks/useMovimientos';
import { useIsProfesor } from '@/hooks/useProfile';
import { toast } from '@/components/ui/use-toast';
import moment from 'moment';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function ReactivoDetail() {
  const { id } = useParams();
  const isProfesor = useIsProfesor();
  const { data: reactivo, isLoading: loadingR } = useReactivo(id);
  const { data: movimientos, isLoading: loadingM } = useMovimientos(id);
  const createMov = useCreateMovimiento();
  const deleteMov = useDeleteMovimiento();
  const [showForm, setShowForm] = useState(false);

  const handleDeleteMovimiento = async (id) => {
    await deleteMov.mutateAsync(id);
    toast({ title: 'Movimiento eliminado' });
  };

  if (loadingR || loadingM) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!reactivo) {
    return <div className="text-center text-muted-foreground py-12">Reactivo no encontrado</div>;
  }

  const stock = calcularStock(movimientos);

const handleMovimiento = async (data) => {
  try {
    await createMov.mutateAsync(data);

    toast({
      title: "Movimiento registrado",
    });

    setShowForm(false);
  } catch (error) {
    console.error(error);

    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reactivos"><ArrowLeft className="w-4 h-4 mr-1" />Reactivos</Link>
        </Button>
      </div>

      <PageHeader
        title={reactivo.nombre}
        description={reactivo.formula ? `Fórmula: ${reactivo.formula}` : undefined}
        actions={
          <div className="flex gap-2">
            {reactivo.fds_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={reactivo.fds_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="w-4 h-4 mr-1.5" />Ver FDS
                </a>
              </Button>
            )}
            {isProfesor && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/reactivos/${id}/editar`}><Pencil className="w-4 h-4 mr-1.5" />Editar</Link>
                </Button>
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />Movimiento
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold">{stock} {reactivo.unidad_medida}</span>
              <StockBadge stock={stock} stockMinimo={reactivo.stock_minimo} />
            </div>
            <InfoRow label="CAS" value={reactivo.cas} />
            <InfoRow label="Marca" value={reactivo.marca} />
            <InfoRow label="Concentración" value={reactivo.concentracion} />
            <InfoRow label="Estado físico" value={reactivo.estado_fisico} />
            <InfoRow label="Ubicación" value={reactivo.ubicacion} />
            <InfoRow label="Stock mínimo" value={`${reactivo.stock_minimo} ${reactivo.unidad_medida}`} />

            {reactivo.observaciones && (
              <div className="pt-3">
                <p className="text-sm text-muted-foreground mb-1">Observaciones</p>
                <p className="text-sm">{reactivo.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kardex history */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-medium">Historial Kardex</h2>
            </div>
            {!movimientos || movimientos.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Sin movimientos registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Cantidad</th>
                      
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">Motivo</th>
                      {isProfesor && <th className="px-4 py-2" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {movimientos.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">
                          {moment(m.created_at).format('DD/MM/YYYY HH:mm')}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            m.tipo === 'entrada' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                          </span>
                        </td>
                        <td className={`px-4 py-2.5 text-right font-medium ${
                          m.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
                        </td>
                     
                        <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{m.motivo}</td>
                        {isProfesor && (
                          <td className="px-4 py-2.5 text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Se eliminará permanentemente este registro del kardex. Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteMovimiento(m.id)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Movement dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar movimiento — {reactivo.nombre}</DialogTitle>
          </DialogHeader>
          <MovimientoForm
            reactivoId={id}
            stockActual={stock}
            unidad={reactivo.unidad_medida}
            onSubmit={handleMovimiento}
            onCancel={() => setShowForm(false)}
            loading={createMov.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}