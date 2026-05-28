-- =============================================================
-- 1sang – Supabase migration
-- Kjør hele denne filen i SQL Editor i ett paste
-- =============================================================


-- -------------------------------------------------------------
-- TABELLER
-- -------------------------------------------------------------

create table songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  author text,
  melody text,
  chorus text,
  verses text[] not null default '{}',
  spotify_youtube text,
  has_chords boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table song_tags (
  song_id uuid references songs(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (song_id, tag_id)
);

create table song_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  melody text,
  chorus text,
  verses text[] not null default '{}',
  spotify_youtube text,
  has_chords boolean not null default false,
  status text default 'pending',
  submitted_at timestamptz default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz
);

create table playlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  playlist_password text,
  is_public boolean not null default false,
  expires_at timestamptz,
  version int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table playlist_items (
  playlist_id uuid references playlists(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  position int not null,
  primary key (playlist_id, song_id)
);

create table users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  role text,
  email text,
  name text
);


-- -------------------------------------------------------------
-- CONSTRAINTS
-- -------------------------------------------------------------

alter table songs add constraint songs_title_unique unique (title);


-- -------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -------------------------------------------------------------

alter table songs enable row level security;
alter table tags enable row level security;
alter table song_tags enable row level security;
alter table song_suggestions enable row level security;
alter table playlists enable row level security;
alter table playlist_items enable row level security;
alter table users enable row level security;

create policy "Songs are publicly readable" on songs for select using (true);
create policy "Tags are publicly readable" on tags for select using (true);
create policy "Song tags are publicly readable" on song_tags for select using (true);
create policy "Anyone can submit suggestions" on song_suggestions for insert with check (true);
create policy "Suggestions readable via API" on song_suggestions for select using (true);
create policy "Public playlists are readable" on playlists for select using (is_public = true);
create policy "Anyone can create playlists" on playlists for insert with check (true);
create policy "Anyone can update playlists" on playlists for update using (true);
create policy "Anyone can delete playlists" on playlists for delete using (true);
create policy "Items from public playlists are readable" on playlist_items
  for select using (
    exists (select 1 from playlists where id = playlist_id and is_public = true)
  );
create policy "Anyone can manage playlist items" on playlist_items for all using (true) with check (true);


-- -------------------------------------------------------------
-- TILGANGER (GRANTS)
-- -------------------------------------------------------------

grant all on all tables in schema public to service_role;
grant select on songs, tags, song_tags, playlists, playlist_items to anon;
grant select on song_suggestions, users to anon, authenticated;
grant select on songs, tags, song_tags, playlists, playlist_items, users to authenticated;
grant insert on song_suggestions to anon;
grant insert, update, delete on playlists, playlist_items to anon, authenticated;


-- -------------------------------------------------------------
-- FUNKSJONER
-- -------------------------------------------------------------

create or replace function slufy(input text) returns text language plpgsql as $$
declare result text;
begin
  result := lower(input);
  result := replace(result, 'æ', 'ea');
  result := replace(result, 'ø', 'o');
  result := replace(result, 'å', 'aa');
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := trim(both '-' from result);
  return result;
end; $$;

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.users (user_id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    'regular'
  )
  on conflict (user_id) do update set email = excluded.email, name = excluded.name;
  return new;
end; $$;

create or replace function cleanup_expired_playlists() returns void language plpgsql as $$
begin
  delete from playlists where expires_at is not null and expires_at < now();
end; $$;

create or replace function playlists_create(
  p_title text,
  p_password text,
  p_is_public boolean,
  p_expires_at timestamptz
) returns playlists language plpgsql as $$
declare
  v_row public.playlists;
begin
  insert into public.playlists (title, playlist_password, is_public, expires_at)
  values (p_title, crypt(p_password, gen_salt('bf')), p_is_public, p_expires_at)
  returning * into v_row;
  return v_row;
end; $$;

create or replace function playlists_add_item(
  p_playlist_id uuid,
  p_password text,
  p_song_id uuid
) returns void language plpgsql as $$
declare
  v_hash text;
  v_next_pos int;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null or crypt(p_password, v_hash) <> v_hash then
    raise exception 'Invalid password';
  end if;
  v_next_pos := (
    select coalesce(max(position), 0) + 1
    from public.playlist_items
    where playlist_id = p_playlist_id
  );
  insert into public.playlist_items (playlist_id, song_id, position)
  values (p_playlist_id, p_song_id, v_next_pos)
  on conflict (playlist_id, song_id) do update set position = excluded.position;
  update public.playlists set version = version + 1 where id = p_playlist_id;
end; $$;

create or replace function playlists_admin_add_item(
  p_playlist_id uuid,
  p_song_id uuid
) returns void language plpgsql as $$
declare
  v_next_pos int;
begin
  v_next_pos := (
    select coalesce(max(position), 0) + 1
    from public.playlist_items
    where playlist_id = p_playlist_id
  );
  insert into public.playlist_items (playlist_id, song_id, position)
  values (p_playlist_id, p_song_id, v_next_pos)
  on conflict (playlist_id, song_id) do update set position = excluded.position;
  update public.playlists set version = version + 1 where id = p_playlist_id;
end; $$;

create or replace function playlists_remove_item(
  p_playlist_id uuid,
  p_password text,
  p_song_id uuid
) returns void language plpgsql as $$
declare
  v_hash text;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null or crypt(p_password, v_hash) <> v_hash then
    raise exception 'Invalid password';
  end if;
  delete from public.playlist_items where playlist_id = p_playlist_id and song_id = p_song_id;
  update public.playlists set version = version + 1 where id = p_playlist_id;
end; $$;

create or replace function playlists_admin_remove_item(
  p_playlist_id uuid,
  p_song_id uuid
) returns void language plpgsql as $$
begin
  delete from public.playlist_items where playlist_id = p_playlist_id and song_id = p_song_id;
  update public.playlists set version = version + 1 where id = p_playlist_id;
end; $$;

create or replace function playlists_delete(
  p_playlist_id uuid,
  p_password text
) returns void language plpgsql as $$
declare
  v_hash text;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null or crypt(p_password, v_hash) <> v_hash then
    raise exception 'Invalid password';
  end if;
  delete from public.playlists where id = p_playlist_id;
end; $$;

create or replace function playlists_admin_delete(
  p_playlist_id uuid
) returns void language plpgsql as $$
begin
  delete from public.playlists where id = p_playlist_id;
end; $$;

create or replace function playlists_update(
  p_playlist_id uuid,
  p_current_password text,
  p_new_password text,
  p_title text,
  p_is_public boolean,
  p_expires_at timestamptz
) returns playlists language plpgsql as $$
declare
  v_hash text;
  v_row public.playlists;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null or crypt(p_current_password, v_hash) <> v_hash then
    raise exception 'Invalid password';
  end if;
  update public.playlists set
    title = p_title,
    is_public = p_is_public,
    expires_at = p_expires_at,
    playlist_password = case
      when p_new_password is not null and btrim(p_new_password) <> ''
      then crypt(p_new_password, gen_salt('bf'))
      else playlist_password
    end,
    version = version + 1,
    updated_at = now()
  where id = p_playlist_id
  returning * into v_row;
  return v_row;
end; $$;

create or replace function playlists_admin_update(
  p_playlist_id uuid,
  p_new_password text,
  p_title text,
  p_is_public boolean,
  p_expires_at timestamptz
) returns playlists language plpgsql as $$
declare
  v_row public.playlists;
begin
  update public.playlists set
    title = p_title,
    is_public = p_is_public,
    expires_at = p_expires_at,
    playlist_password = case
      when p_new_password is not null and btrim(p_new_password) <> ''
      then crypt(p_new_password, gen_salt('bf'))
      else playlist_password
    end,
    version = version + 1,
    updated_at = now()
  where id = p_playlist_id
  returning * into v_row;
  return v_row;
end; $$;

create or replace function playlists_get_detail(p_playlist_id uuid)
returns table(
  id uuid, title text, is_public boolean, expires_at timestamptz,
  created_at timestamptz, updated_at timestamptz, version int, has_password boolean
) language sql as $$
  select
    p.id, p.title, p.is_public, p.expires_at,
    p.created_at, p.updated_at, p.version,
    (p.playlist_password is not null and btrim(p.playlist_password) <> '') as has_password
  from public.playlists p
  where p.id = p_playlist_id;
$$;

create or replace function playlists_list_public()
returns table(
  id uuid, title text, is_public boolean, expires_at timestamptz,
  created_at timestamptz, updated_at timestamptz, version int, has_password boolean
) language sql as $$
  select
    p.id, p.title, p.is_public, p.expires_at,
    p.created_at, p.updated_at, p.version,
    (p.playlist_password is not null and btrim(p.playlist_password) <> '') as has_password
  from public.playlists p
  where p.is_public = true;
$$;

create or replace function playlists_verify_password(p_playlist_id uuid, p_password text)
returns boolean language plpgsql as $$
declare
  v_hash text;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null then return false; end if;
  return crypt(p_password, v_hash) = v_hash;
end; $$;


-- -------------------------------------------------------------
-- TRIGGERE
-- -------------------------------------------------------------

create trigger trg_songs_updated_at
  before update on songs
  for each row execute function set_updated_at();

create trigger trg_playlists_updated_at
  before update on playlists
  for each row execute function set_updated_at();

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- -------------------------------------------------------------
-- SLUG-OPPDATERING (kjør etter seeding av sanger)
-- -------------------------------------------------------------

-- update songs set slug = slufy(title) where slug is null;


-- -------------------------------------------------------------
-- GRANTS FOR FUNKSJONER
-- -------------------------------------------------------------

grant execute on all functions in schema public to anon, authenticated;
