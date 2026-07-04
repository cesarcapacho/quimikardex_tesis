import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useMovimientos(reactivoId) {
  return useQuery({
    queryKey: ['movimientos', reactivoId],
    queryFn: () => base44.entities.MovimientoKardex.filter(
      { reactivo_id: reactivoId },
      '-created_date'
    ),
    enabled: !!reactivoId,
  });
}

export function useAllMovimientos(limit = 50) {
  return useQuery({
    queryKey: ['allMovimientos'],
    queryFn: () => base44.entities.MovimientoKardex.list('-created_date', limit),
  });
}

export function useCreateMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.MovimientoKardex.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos'] });
      qc.invalidateQueries({ queryKey: ['allMovimientos'] });
    },
  });
}

export function useDeleteMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.entities.MovimientoKardex.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos'] });
      qc.invalidateQueries({ queryKey: ['allMovimientos'] });
    },
  });
}

export function calcularStock(movimientos) {
  if (!movimientos) return 0;
  return movimientos.reduce((acc, m) => {
    return m.tipo === 'entrada' ? acc + m.cantidad : acc - m.cantidad;
  }, 0);
}

export function getSemaforoColor(stock, stockMinimo) {
  if (stock <= 0) return 'red';
  if (stock <= stockMinimo) return 'yellow';
  return 'green';
}