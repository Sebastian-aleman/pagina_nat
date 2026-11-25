-- Inventarium: tabla de votos en Supabase.
-- Ejecutar en el SQL Editor del proyecto. PIN del equipo: 123456 (cámbialo aquí abajo si quieres otro;
-- (debe tener tantos dígitos como "adminPinLength" en src/data/config.json; por defecto 6).

create table if not exists public.votes (
  id uuid primary key,
  project_id text not null,
  ratings jsonb not null check (jsonb_typeof(ratings) = 'object'),
  created_at timestamptz not null default now()
);
alter table public.votes enable row level security;

-- Cualquiera con la página puede ENVIAR votos, pero nadie puede leerlos directamente.
drop policy if exists "enviar votos" on public.votes;
create policy "enviar votos" on public.votes for insert to anon with check (true);

-- El PIN vive en la base de datos, no en el código público.
create table if not exists public.admin_config (key text primary key, value text not null);
alter table public.admin_config enable row level security;  -- sin políticas: nadie la lee desde la web
insert into public.admin_config (key, value) values ('pin', '123456')
  on conflict (key) do nothing;

-- Único camino de lectura: función que exige el PIN.
create or replace function public.admin_votes(p_pin text)
returns setof public.votes
language plpgsql security definer set search_path = public as $$
begin
  if p_pin is distinct from (select value from public.admin_config where key = 'pin') then
    raise exception 'bad_pin' using errcode = '28000';
  end if;
  return query select * from public.votes order by created_at;
end $$;
revoke all on function public.admin_votes(text) from public;
grant execute on function public.admin_votes(text) to anon;
