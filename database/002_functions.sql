-- ==========================================================
-- QUIMIKARDEX
-- 002_functions.sql
--
-- Contiene:
-- • Función update_updated_at_column()
-- • Trigger updated_at
-- • Función handle_new_user()
-- • Trigger creación automática de profile
-- • Función registrar_movimiento()
-- ==========================================================

-- ==========================================================
-- FUNCIÓN: actualizar updated_at
-- ==========================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ==========================================================
-- TRIGGERS updated_at
-- ==========================================================

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_reactivos_updated_at
BEFORE UPDATE
ON public.reactivos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- FUNCIÓN: crear profile automáticamente
-- ==========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

    INSERT INTO public.profiles(
        user_id,
        full_name,
        role,
        is_active
    )
    VALUES(
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            ''
        ),
        'estudiante',
        true
    );

    RETURN NEW;

END;
$$;

-- ==========================================================
-- TRIGGER nuevo usuario
-- ==========================================================

CREATE TRIGGER on_auth_user_created
AFTER INSERT
ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- FUNCIÓN registrar_movimiento
-- ==========================================================

CREATE OR REPLACE FUNCTION public.registrar_movimiento(

    p_reactivo_id UUID,

    p_tipo movimiento_tipo,

    p_cantidad NUMERIC,

    p_motivo TEXT,

    p_lote TEXT DEFAULT NULL,

    p_proveedor TEXT DEFAULT NULL,

    p_fecha_vencimiento DATE DEFAULT NULL,

    p_observaciones TEXT DEFAULT NULL

)

RETURNS movimientos_kardex

LANGUAGE plpgsql

SECURITY DEFINER

AS $$

DECLARE

    v_stock_actual NUMERIC;

    v_usuario UUID;

    nuevo_movimiento movimientos_kardex;

BEGIN

    -- Usuario autenticado

    v_usuario := auth.uid();

    IF v_usuario IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.';
    END IF;

    -- Calcular stock actual

    SELECT
        COALESCE(
            SUM(
                CASE
                    WHEN tipo = 'entrada'
                        THEN cantidad
                    ELSE
                        -cantidad
                END
            ),
            0
        )
    INTO v_stock_actual

    FROM movimientos_kardex

    WHERE reactivo_id = p_reactivo_id;

    -- Validar salidas

    IF p_tipo = 'salida'
    AND p_cantidad > v_stock_actual THEN

        RAISE EXCEPTION
            'Stock insuficiente. Disponible: %',
            v_stock_actual;

    END IF;

    -- Insertar movimiento

    INSERT INTO movimientos_kardex(

        reactivo_id,

        responsable_id,

        tipo,

        cantidad,

        motivo,

        lote,

        proveedor,

        fecha_vencimiento,

        observaciones

    )

    VALUES(

        p_reactivo_id,

        v_usuario,

        p_tipo,

        p_cantidad,

        p_motivo,

        p_lote,

        p_proveedor,

        p_fecha_vencimiento,

        p_observaciones

    )

    RETURNING *

    INTO nuevo_movimiento;

    RETURN nuevo_movimiento;

END;

$$;