-- ==========================================================
-- QUIMIKARDEX
-- 004_views.sql
--
-- Vistas para consultas del sistema
-- ==========================================================

-------------------------------------------------------------
-- Eliminar la vista si ya existe
-------------------------------------------------------------

DROP VIEW IF EXISTS public.v_stock_reactivos;

-------------------------------------------------------------
-- Vista de stock por reactivo
-------------------------------------------------------------

CREATE VIEW public.v_stock_reactivos AS

SELECT

    r.id AS reactivo_id,

    r.nombre,

    r.cas,

    r.unidad_medida,

    r.stock_minimo,

    r.is_active,

    COALESCE(

        SUM(

            CASE

                WHEN m.tipo = 'entrada'

                    THEN m.cantidad

                WHEN m.tipo = 'salida'

                    THEN -m.cantidad

                ELSE 0

            END

        ),

        0

    ) AS stock_actual,

    CASE

        WHEN COALESCE(

            SUM(

                CASE

                    WHEN m.tipo = 'entrada'

                        THEN m.cantidad

                    WHEN m.tipo = 'salida'

                        THEN -m.cantidad

                    ELSE 0

                END

            ),

            0

        ) <= 0

        THEN 'agotado'

        WHEN COALESCE(

            SUM(

                CASE

                    WHEN m.tipo = 'entrada'

                        THEN m.cantidad

                    WHEN m.tipo = 'salida'

                        THEN -m.cantidad

                    ELSE 0

                END

            ),

            0

        ) <= r.stock_minimo

        THEN 'bajo'

        ELSE 'normal'

    END AS semaforo

FROM reactivos r

LEFT JOIN movimientos_kardex m

ON r.id = m.reactivo_id

WHERE r.is_active = true

GROUP BY

    r.id,

    r.nombre,

    r.cas,

    r.unidad_medida,

    r.stock_minimo,

    r.is_active;