-- ==========================================================
-- QUIMIKARDEX
-- 001_schema.sql
--
-- Crea:
-- • Tipos ENUM
-- • Tablas
-- • Relaciones
-- • Restricciones
-- • Índices
--
-- No incluye:
-- • Triggers
-- • Functions
-- • Views
-- • RLS
-- ==========================================================

-- ==========================================================
-- ENUMS
-- ==========================================================

CREATE TYPE user_role AS ENUM (
    'profesor',
    'estudiante'
);

CREATE TYPE unidad_medida_enum AS ENUM (
    'g',
    'kg',
    'mL',
    'L',
    'unidad'
);

CREATE TYPE estado_fisico_enum AS ENUM (
    'sólido',
    'líquido',
    'gaseoso'
);

CREATE TYPE movimiento_tipo AS ENUM (
    'entrada',
    'salida'
);

-- ==========================================================
-- TABLA: profiles
-- ==========================================================

CREATE TABLE public.profiles (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE,

    full_name TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'estudiante',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_profile_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- ==========================================================
-- TABLA: reactivos
-- ==========================================================

CREATE TABLE public.reactivos (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nombre TEXT NOT NULL,

    cas TEXT,

    formula TEXT,

    unidad_medida unidad_medida_enum NOT NULL DEFAULT 'mL',

    stock_minimo NUMERIC(12,2) NOT NULL DEFAULT 0,

    ubicacion TEXT,

    marca TEXT,

    concentracion TEXT,

    estado_fisico estado_fisico_enum NOT NULL DEFAULT 'líquido',

    fds_url TEXT,

    observaciones TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_stock_minimo
        CHECK (stock_minimo >= 0)

);

-- ==========================================================
-- TABLA: movimientos_kardex
-- ==========================================================

CREATE TABLE public.movimientos_kardex (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reactivo_id UUID NOT NULL,

    responsable_id UUID NOT NULL,

    tipo movimiento_tipo NOT NULL,

    cantidad NUMERIC(12,2) NOT NULL,

    motivo TEXT NOT NULL,

    lote TEXT,

    proveedor TEXT,

    fecha_vencimiento DATE,

    observaciones TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_movimiento_reactivo
        FOREIGN KEY (reactivo_id)
        REFERENCES reactivos(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_movimiento_responsable
        FOREIGN KEY (responsable_id)
        REFERENCES auth.users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_cantidad
        CHECK (cantidad > 0)

);

-- ==========================================================
-- ÍNDICES
-- ==========================================================

CREATE INDEX idx_profiles_user
ON profiles(user_id);

CREATE INDEX idx_profiles_role
ON profiles(role);

CREATE INDEX idx_reactivos_nombre
ON reactivos(nombre);

CREATE INDEX idx_reactivos_activos
ON reactivos(is_active);

CREATE INDEX idx_movimientos_reactivo
ON movimientos_kardex(reactivo_id);

CREATE INDEX idx_movimientos_responsable
ON movimientos_kardex(responsable_id);

CREATE INDEX idx_movimientos_fecha
ON movimientos_kardex(created_at DESC);