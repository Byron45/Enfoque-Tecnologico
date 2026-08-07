create table if not exists public.agentes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text,
  institucion text,
  edad integer,
  avatar text,
  nivel integer default 1,
  mision_volcan boolean default false,
  mision_inundacion boolean default false,
  mision_evacuacion boolean default false,
  ultima_conexion timestamptz
);

alter table public.agentes enable row level security;

drop policy if exists "Lectura publica de agentes" on public.agentes;
create policy "Lectura publica de agentes"
on public.agentes
for select
to anon, authenticated
using (true);

drop policy if exists "Registrar agentes desde el lobby" on public.agentes;
create policy "Registrar agentes desde el lobby"
on public.agentes
for insert
to anon, authenticated
with check (true);

drop policy if exists "Actualizar progreso de agentes" on public.agentes;
create policy "Actualizar progreso de agentes"
on public.agentes
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Eliminar agentes desde el panel admin" on public.agentes;
create policy "Eliminar agentes desde el panel admin"
on public.agentes
for delete
to anon, authenticated
using (true);
