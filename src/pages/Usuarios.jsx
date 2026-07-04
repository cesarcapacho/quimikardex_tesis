import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useProfiles, useUpdateProfile, useDeleteProfile } from '@/hooks/useProfile';
import { toast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function Usuarios() {
  const { data: profiles, isLoading } = useProfiles();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();

  const handleRoleChange = async (profileId, newRole) => {
    await updateProfile.mutateAsync({ id: profileId, data: { role: newRole } });
    toast({ title: `Rol actualizado a ${newRole}` });
  };

  const handleDelete = async (profileId) => {
    await deleteProfile.mutateAsync(profileId);
    toast({ title: 'Usuario eliminado' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios y roles del sistema"
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Registro</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cambiar rol</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(profiles || []).map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium">{p.full_name}</span>
                      {p.centro_formacion && (
                        <p className="text-xs text-muted-foreground">{p.centro_formacion}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.role === 'profesor' ? 'default' : 'secondary'}>
                        {p.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {moment(p.created_date).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={p.role} onValueChange={(v) => handleRoleChange(p.id, v)}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profesor">Profesor</SelectItem>
                          <SelectItem value="estudiante">Estudiante</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará el perfil de <strong>{p.full_name}</strong>. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(p.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}