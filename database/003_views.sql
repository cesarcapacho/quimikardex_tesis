-- ==========================================================
-- QUIMIKARDEX
-- 003_rls_policies.sql
--
-- Row Level Security
-- ==========================================================

-------------------------------------------------------------
-- ACTIVAR RLS
-------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE reactivos ENABLE ROW LEVEL SECURITY;

ALTER TABLE movimientos_kardex ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------
-- FUNCIÓN AUXILIAR
-- ¿El usuario autenticado es profesor?
-------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_profesor()

RETURNS BOOLEAN

LANGUAGE sql

STABLE

SECURITY DEFINER

AS $$

SELECT EXISTS (

    SELECT 1

    FROM profiles

    WHERE user_id = auth.uid()

    AND role = 'profesor'
    AND is_active = true

);

$$;

-------------------------------------------------------------
-- PROFILES
-------------------------------------------------------------

-- Ver mi propio perfil

CREATE POLICY "Ver mi perfil"

ON profiles

FOR SELECT

USING (

    user_id = auth.uid()

    OR

    public.is_profesor()

);

-------------------------------------------------------------

-- Actualizar mi perfil

CREATE POLICY "Actualizar mi perfil"

ON profiles

FOR UPDATE

USING (

    user_id = auth.uid()

)

WITH CHECK (

    user_id = auth.uid()

);

-------------------------------------------------------------

-- Profesor administra perfiles

CREATE POLICY "Profesor administra perfiles"

ON profiles

FOR ALL

USING (

    public.is_profesor()

)

WITH CHECK (

    public.is_profesor()

);

-------------------------------------------------------------
-- REACTIVOS
-------------------------------------------------------------

-- Todos pueden consultar reactivos activos

CREATE POLICY "Leer reactivos"

ON reactivos

FOR SELECT

USING (

    is_active = true

);

-------------------------------------------------------------

-- Solo profesor crea

CREATE POLICY "Profesor crea reactivos"

ON reactivos

FOR INSERT

WITH CHECK (

    public.is_profesor()

);

-------------------------------------------------------------

-- Solo profesor actualiza

CREATE POLICY "Profesor actualiza reactivos"

ON reactivos

FOR UPDATE

USING (

    public.is_profesor()

)

WITH CHECK (

    public.is_profesor()

);

-------------------------------------------------------------

-- Solo profesor elimina (soft delete)

CREATE POLICY "Profesor elimina reactivos"

ON reactivos

FOR DELETE

USING (

    public.is_profesor()

);

-------------------------------------------------------------
-- MOVIMIENTOS
-------------------------------------------------------------

-- Todos pueden consultar

CREATE POLICY "Leer movimientos"

ON movimientos_kardex

FOR SELECT

USING (

    true

);

-------------------------------------------------------------

-- Solo profesor inserta

CREATE POLICY "Profesor registra movimientos"

ON movimientos_kardex

FOR INSERT

WITH CHECK (

    public.is_profesor()

);

-------------------------------------------------------------

-- Solo profesor elimina

CREATE POLICY "Profesor elimina movimientos"

ON movimientos_kardex

FOR DELETE

USING (

    public.is_profesor()

);