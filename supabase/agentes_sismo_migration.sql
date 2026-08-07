alter table public.agentes
  add column if not exists mision_sismo boolean default false;
