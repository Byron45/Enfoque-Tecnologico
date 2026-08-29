-- ==============================================================================
-- Script de migración para Soporte de Métricas y Tabulación de Quizes en Supabase
-- Proyecto: Enfoque Tecnológico - Misión Prevención Baños de Agua Santa
-- ==============================================================================

-- 1. Agregar la columna metricas_quiz a la tabla agentes si no existe
ALTER TABLE public.agentes 
ADD COLUMN IF NOT EXISTS metricas_quiz JSONB DEFAULT '{}'::jsonb;

-- 2. Añadir comentario descriptivo a la columna
COMMENT ON COLUMN public.agentes.metricas_quiz IS 'Almacena el total de aciertos, errores y el desglose detallado por misión y pregunta para cada estudiante.';
