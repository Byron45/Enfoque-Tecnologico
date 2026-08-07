create table if not exists public.sugerencias (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text,
  institucion text,
  calificacion integer not null check (calificacion between 1 and 5),
  comentario text
);

alter table public.sugerencias enable row level security;

drop policy if exists "Enviar sugerencias desde la app" on public.sugerencias;
create policy "Enviar sugerencias desde la app"
on public.sugerencias
for insert
to anon, authenticated
with check (true);

drop policy if exists "Lectura de sugerencias para el panel admin" on public.sugerencias;
create policy "Lectura de sugerencias para el panel admin"
on public.sugerencias
for select
to anon, authenticated
using (true);
