import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useReactivos() {
  return useQuery({
    queryKey: ["reactivos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reactivos")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    },
  });
}

export function useReactivo(id) {
  return useQuery({
    queryKey: ["reactivo", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reactivos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    },
  });
}

export function useCreateReactivo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data, error } = await supabase
        .from("reactivos")
        .insert(formData)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reactivos"] });
    },
  });
}

export function useUpdateReactivo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: formData }) => {
      const { data, error } = await supabase
        .from("reactivos")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["reactivos"] });
      qc.invalidateQueries({ queryKey: ["reactivo", id] });
    },
  });
}

export function useDeleteReactivo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("reactivos")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reactivos"] });
    },
  });
}