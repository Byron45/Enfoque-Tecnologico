-- Agrega el progreso de la nueva misión "Diagnóstico" (Misión 1) a la tabla existente de agentes.
-- Ejecuta este archivo una sola vez en Supabase > SQL Editor.

alter table public.agentes
  add column if not exists mision_diagnostico boolean default false;
