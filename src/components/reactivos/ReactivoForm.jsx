import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";

const UNIDADES = ["g", "kg", "mL", "L", "unidad"];
const ESTADOS = ["sólido", "líquido", "gaseoso"];

const EMPTY = {
  nombre: "",
  cas: "",
  formula: "",
  unidad_medida: "",
  stock_minimo: 0,
  ubicacion: "",
  marca: "",
  concentracion: "",
  estado_fisico: "",
  fds_url: "",
  observaciones: "",
};

export default function ReactivoForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    ...EMPTY,
    ...initial,
  });

  const [uploading, setUploading] = useState(false);

  const set = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  async function handleFds(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("fds")
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("fds")
        .getPublicUrl(fileName);

      set("fds_url", data.publicUrl);

      toast({
        title: "FDS subida correctamente",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Error al subir la FDS",
        variant: "destructive",
      });
    }

    setUploading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.nombre.trim()) {
      toast({
        title: "El nombre es obligatorio",
        variant: "destructive",
      });

      return;
    }

    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <Label>Nombre *</Label>
          <Input
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
          />
        </div>

        <div>
          <Label>CAS</Label>
          <Input
            value={form.cas}
            onChange={(e) => set("cas", e.target.value)}
          />
        </div>

        <div>
          <Label>Fórmula</Label>
          <Input
            value={form.formula}
            onChange={(e) => set("formula", e.target.value)}
          />
        </div>

        <div>
          <Label>Marca</Label>
          <Input
            value={form.marca}
            onChange={(e) => set("marca", e.target.value)}
          />
        </div>

        <div>
          <Label>Concentración</Label>
          <Input
            value={form.concentracion}
            onChange={(e) => set("concentracion", e.target.value)}
          />
        </div>

        <div>
          <Label>Ubicación</Label>
          <Input
            value={form.ubicacion}
            onChange={(e) => set("ubicacion", e.target.value)}
          />
        </div>

        <div>
          <Label>Unidad</Label>

          <Select
            value={form.unidad_medida}
            onValueChange={(v) => set("unidad_medida", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {UNIDADES.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Estado físico</Label>

          <Select
            value={form.estado_fisico}
            onValueChange={(v) => set("estado_fisico", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {ESTADOS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Stock</Label>

          <Input
            type="number"
            value={form.stock_minimo}
            onChange={(e) =>
              set("stock_minimo", Number(e.target.value))
            }
          />
        </div>

      </div>

      <div className="space-y-2">
        <Label>Ficha de Datos de Seguridad (PDF)</Label>

        <Input
          type="file"
          accept=".pdf"
          onChange={handleFds}
          className="cursor-pointer file:cursor-pointer
    file:mr-4 file:py-1 file:px-3
    file:rounded-md file:border-0
    file:text-xs file:font-semibold
    file:bg-[#39A900] file:text-white
    hover:file:bg-[#2e8500]
    transition-colors shadow-sm"
        />

        {uploading && (
          <Loader2 className="w-4 h-4 animate-spin mt-2" />
        )}

        {form.fds_url && (
          <a
            href={form.fds_url}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-sm underline block mt-1"
          >
            Ver FDS subida
          </a>
        )}
      </div>

      <div>
        <Label>Observaciones</Label>

        <Textarea
          rows={4}
          value={form.observaciones}
          onChange={(e) =>
            set("observaciones", e.target.value)
          }
        />
      </div>

      <div className="flex justify-end gap-3">

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          disabled={loading || uploading}
        >
          {(loading || uploading) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}

          {initial ? "Guardar cambios" : "Crear reactivo"}
        </Button>

      </div>

    </form>
  );
}