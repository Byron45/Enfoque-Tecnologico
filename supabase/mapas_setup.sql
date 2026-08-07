create table if not exists public.mapas_recursos (
  id text primary key,
  titulo text,
  descripcion text,
  tif_url text,
  preview_url text,
  storage_folder text,
  updated_at timestamptz not null default now()
);

alter table public.mapas_recursos add column if not exists titulo text;
alter table public.mapas_recursos add column if not exists descripcion text;
alter table public.mapas_recursos add column if not exists tif_url text;
alter table public.mapas_recursos add column if not exists preview_url text;
alter table public.mapas_recursos add column if not exists storage_folder text;
alter table public.mapas_recursos add column if not exists updated_at timestamptz default now();

alter table public.mapas_recursos enable row level security;

drop policy if exists "Lectura publica de mapas" on public.mapas_recursos;
create policy "Lectura publica de mapas"
on public.mapas_recursos
for select
to anon, authenticated
using (true);

drop policy if exists "Insertar mapas desde el panel" on public.mapas_recursos;
create policy "Insertar mapas desde el panel"
on public.mapas_recursos
for insert
to anon, authenticated
with check (true);

drop policy if exists "Actualizar mapas desde el panel" on public.mapas_recursos;
create policy "Actualizar mapas desde el panel"
on public.mapas_recursos
for update
to anon, authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('mapas', 'mapas', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Lectura publica del bucket mapas" on storage.objects;
create policy "Lectura publica del bucket mapas"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'mapas');

drop policy if exists "Subir archivos al bucket mapas" on storage.objects;
create policy "Subir archivos al bucket mapas"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'mapas');

drop policy if exists "Actualizar archivos del bucket mapas" on storage.objects;
create policy "Actualizar archivos del bucket mapas"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'mapas')
with check (bucket_id = 'mapas');
