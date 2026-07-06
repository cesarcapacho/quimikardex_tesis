# QUIMIKARDEX

Sistema web para la gestión de inventario de reactivos químicos mediante Kardex.

---

## Tecnologías

- React 19
- Vite
- TailwindCSS
- Shadcn UI
- React Query
- React Router
- Supabase
- PostgreSQL

---

## Funcionalidades

- Autenticación de usuarios
- Gestión de reactivos
- Kardex de entradas y salidas
- Reportes PDF
- Gestión de usuarios
- Carga de Fichas de Datos de Seguridad (PDF)
- Control de stock
- Roles (Profesor / Estudiante)

---

## Instalación

Clonar el proyecto

```bash
git clone <repositorio>
```

Instalar dependencias

```bash
npm install
```

Crear el archivo `.env`

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Ejecutar

```bash
npm run dev
```

Build

```bash
npm run build
```

---

## Base de datos

Toda la estructura SQL se encuentra en:

```
/database
```

Incluye:

- tablas
- relaciones
- RLS
- Storage
- funciones
- triggers
- políticas

---

## Autor

Proyecto desarrollado como sistema de inventario para laboratorio químico del sena como parte de proyecto final de ADSO .

## Autores

Cesar Capacho, Michael Rey, Esteban Velandia.
Ficha 3065370