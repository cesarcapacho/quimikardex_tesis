import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useReactivos() {
  return useQuery({
    queryKey: ['reactivos'],
    queryFn: () => base44.entities.Reactivo.filter({ is_active: true }, '-created_date'),
  });
}

export function useReactivo(id) {
  return useQuery({
    queryKey: ['reactivo', id],
    queryFn: () => base44.entities.Reactivo.get(id),
    enabled: !!id,
  });
}

export function useCreateReactivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Reactivo.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reactivos'] }),
  });
}

export function useUpdateReactivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reactivo.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['reactivos'] });
      qc.invalidateQueries({ queryKey: ['reactivo', id] });
    },
  });
}

export function useDeleteReactivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.entities.Reactivo.update(id, { is_active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reactivos'] }),
  });
}