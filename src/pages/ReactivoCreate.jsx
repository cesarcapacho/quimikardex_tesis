import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import ReactivoForm from '@/components/reactivos/ReactivoForm';
import { useCreateReactivo } from '@/hooks/useReactivos';
import { toast } from '@/components/ui/use-toast';

export default function ReactivoCreate() {
  const navigate = useNavigate();
  const mutation = useCreateReactivo();

  const handleSubmit = async (data) => {
    await mutation.mutateAsync(data);
    toast({ title: 'Reactivo creado exitosamente' });
    navigate('/reactivos');
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Nuevo reactivo" description="Registra un nuevo reactivo químico en el inventario" />
      <ReactivoForm onSubmit={handleSubmit} onCancel={() => navigate('/reactivos')} loading={mutation.isPending} />
    </div>
  );
}