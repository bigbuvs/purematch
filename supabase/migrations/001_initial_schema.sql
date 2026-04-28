-- PureMatch — Esquema inicial de base de datos
-- Ejecutar en: InsForge Dashboard → SQL Editor
-- O desde terminal: psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql

-- ─── Extensiones ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Tabla: users ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null unique,
  phone       text,
  rut         text,
  zone        text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ─── Tabla: dogs ──────────────────────────────────────────────────────────────
create table if not exists public.dogs (
  id               uuid primary key default uuid_generate_v4(),
  owner_id         uuid not null references public.users(id) on delete cascade,
  name             text not null,
  breed            text not null,
  age              text not null,
  sex              text not null check (sex in ('Macho', 'Hembra')),
  pedigree_number  text,
  zone             text,
  verified         boolean not null default false,
  score            integer not null default 0 check (score between 0 and 100),
  photos           text[] not null default '{}',
  created_at       timestamptz not null default now()
);

-- ─── Tabla: documents ─────────────────────────────────────────────────────────
create table if not exists public.documents (
  id           uuid primary key default uuid_generate_v4(),
  dog_id       uuid not null references public.dogs(id) on delete cascade,
  type         text not null check (type in ('pedigree', 'vaccines', 'health')),
  file_url     text not null,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  uploaded_at  timestamptz not null default now(),
  reviewed_at  timestamptz
);

-- ─── Tabla: matches ───────────────────────────────────────────────────────────
create table if not exists public.matches (
  id                uuid primary key default uuid_generate_v4(),
  dog_a_id          uuid not null references public.dogs(id) on delete cascade,
  dog_b_id          uuid not null references public.dogs(id) on delete cascade,
  status_a          text not null default 'pending' check (status_a in ('pending', 'accepted', 'rejected')),
  status_b          text not null default 'pending' check (status_b in ('pending', 'accepted', 'rejected')),
  contact_unlocked  boolean not null default false,
  unlocked_at       timestamptz,
  created_at        timestamptz not null default now(),
  unique (dog_a_id, dog_b_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.dogs enable row level security;
alter table public.documents enable row level security;
alter table public.matches enable row level security;

-- Users: cada usuario ve solo su propio perfil
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

-- Dogs: propietario gestiona, todos pueden leer perros verificados
create policy "dogs: owner manage" on public.dogs
  for all using (auth.uid() = owner_id);

create policy "dogs: public read verified" on public.dogs
  for select using (verified = true);

-- Documents: solo el propietario del perro
create policy "documents: owner manage" on public.documents
  for all using (
    auth.uid() = (select owner_id from public.dogs where id = dog_id)
  );

-- Matches: las dos partes involucradas
create policy "matches: participants" on public.matches
  for all using (
    auth.uid() = (select owner_id from public.dogs where id = dog_a_id)
    or
    auth.uid() = (select owner_id from public.dogs where id = dog_b_id)
  );
