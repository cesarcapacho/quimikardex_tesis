import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import ReactivoForm from '@/components/reactivos/ReactivoForm';
import { useReactivo, useUpdateReactivo } from '@/hooks/useReactivos';
import { toast } from '@/components/ui/use-toast';

export default function ReactivoEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: reactivo, isLoading } = useReactivo(id);
  const mutation = useUpdateReactivo();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!reactivo) {
    return <div className="text-center text-muted-foreground py-12">Reactivo no encontrado</div>;
  }

  const handleSubmit = async (data) => {
    await mutation.mutateAsync({ id, data });
    toast({ title: 'Reactivo actualizado' });
    navigate(`/reactivos/${id}`);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Editar reactivo" description={reactivo.nombre} />
      <ReactivoForm
        initial={reactivo}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/reactivos/${id}`)}
        loading={mutation.isPending}
      />
    </div>
  );
}