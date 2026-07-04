import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useCurrentProfile() {
  return useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ user_id: user.id });
      if (profiles.length > 0) return profiles[0];
      // Auto-create profile for new users (default: estudiante)
      const newProfile = await base44.entities.Profile.create({
        user_id: user.id,
        full_name: user.full_name || user.email,
        role: 'estudiante',
      });
      return newProfile;
    },
  });
}

export function useIsProfesor() {
  const { data: profile } = useCurrentProfile();
  return profile?.role === 'profesor';
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date'),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => base44.entities.Profile.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      qc.invalidateQueries({ queryKey: ['currentProfile'] });
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.entities.Profile.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}