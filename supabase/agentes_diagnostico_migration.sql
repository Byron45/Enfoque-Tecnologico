alter table public.agentes
  add column if not exists mision_diagnostico boolean default false;
