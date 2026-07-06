import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useMovimientos(reactivoId) {
  return useQuery({
    queryKey: ["movimientos", reactivoId],
    enabled: !!reactivoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimientos_kardex")
        .select("*")
        .eq("reactivo_id", reactivoId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    },
  });
}

export function useAllMovimientos(limit = 50) {
  return useQuery({
    queryKey: ["allMovimientos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimientos_kardex")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    },
  });
}

export function useCreateMovimiento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data, error } = await supabase.rpc("registrar_movimiento", {
        p_reactivo_id: formData.reactivo_id,
        p_tipo: formData.tipo,
        p_cantidad: formData.cantidad,
        p_motivo: formData.motivo,
        p_lote: formData.lote ?? null,
        p_proveedor: formData.proveedor ?? null,
        p_fecha_vencimiento: formData.fecha_vencimiento || null,
        p_observaciones: formData.observaciones ?? null,
      });

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["allMovimientos"] });
      qc.invalidateQueries({ queryKey: ["reactivos"] });
    },
  });
}

export function useDeleteMovimiento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("movimientos_kardex")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["allMovimientos"] });
      qc.invalidateQueries({ queryKey: ["reactivos"] });
    },
  });
}

export function calcularStock(movimientos) {
  if (!movimientos) return 0;

  return movimientos.reduce((acc, movimiento) => {
    return movimiento.tipo === "entrada"
      ? acc + movimiento.cantidad
      : acc - movimiento.cantidad;
  }, 0);
}

export function getSemaforoColor(stock, stockMinimo) {
  if (stock <= 0) return "red";
  if (stock <= stockMinimo) return "yellow";
  return "green";
}