-- 1. Asegurarse de que la tabla profiles existe con los campos correctos
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text,
  full_name text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Row Level Security (RLS) en profiles (buena práctica)
alter table public.profiles enable row level security;

-- Política para que cualquiera pueda ver perfiles (o restringir según necesidad)
create policy "Public profiles are viewable by everyone"
on public.profiles for select
using ( true );

-- Política para que los usuarios puedan actualizar su propio perfil
create policy "Users can update own profile"
on public.profiles for update
using ( auth.uid() = id );

-- 3. Eliminar el trigger y función anteriores para evitar conflictos
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 4. Crear la función robusta para manejar nuevos usuarios
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 5. Recrear el trigger
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
