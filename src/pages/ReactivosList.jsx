import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import PageHeader from '@/components/layout/PageHeader';
import StockBadge from '@/components/layout/StockBadge';
import { useReactivos, useDeleteReactivo } from '@/hooks/useReactivos';
import { useAllMovimientos, calcularStock } from '@/hooks/useMovimientos';
import { useIsProfesor } from '@/hooks/useProfile';
import { toast } from '@/components/ui/use-toast';

export default function ReactivosList() {
  const [search, setSearch] = useState('');
  const isProfesor = useIsProfesor();
  const { data: reactivos, isLoading } = useReactivos();
  const { data: movimientos } = useAllMovimientos(500);
  const deleteMutation = useDeleteReactivo();

  const stockMap = {};
  (movimientos || []).forEach((m) => {
    if (!stockMap[m.reactivo_id]) stockMap[m.reactivo_id] = [];
    stockMap[m.reactivo_id].push(m);
  });

  const filtered = (reactivos || [])
    .map((r) => ({ ...r, stock: calcularStock(stockMap[r.id]) }))
    .filter((r) => r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.cas?.toLowerCase().includes(search.toLowerCase()) ||
      r.formula?.toLowerCase().includes(search.toLowerCase())
    );

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
    toast({ title: 'Reactivo eliminado' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reactivos"
        description={`${filtered.length} reactivos registrados`}
        actions={isProfesor && (
          <Button asChild size="sm">
            <Link to="/reactivos/nuevo"><Plus className="w-4 h-4 mr-1.5" />Nuevo reactivo</Link>
          </Button>
        )}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, CAS o fórmula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground text-sm">
            {search ? 'No se encontraron reactivos' : 'No hay reactivos registrados'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">CAS</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Fórmula</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/reactivos/${r.id}`} className="font-medium text-foreground hover:text-primary">
                          {r.nombre}
                        </Link>
                        {r.marca && <p className="text-xs text-muted-foreground">{r.marca}</p>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{r.cas || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">{r.formula || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{r.stock}</span>
                        <span className="text-muted-foreground text-xs ml-1">{r.unidad_medida}</span>
                      </td>
                      <td className="px-4 py-3"><StockBadge stock={r.stock} stockMinimo={r.stock_minimo} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={`/reactivos/${r.id}`}><Eye className="w-4 h-4" /></Link>
                          </Button>
                          {isProfesor && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link to={`/reactivos/${r.id}/editar`}><Pencil className="w-4 h-4" /></Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar reactivo?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Se desactivará "{r.nombre}" del inventario. Los movimientos del kardex se conservarán.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(r.id)}>Eliminar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}