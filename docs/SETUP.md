# Oppsett av 1sang fra scratch

**1sang** er en digital sangbok for speidere, bygget som en Next.js PWA med Supabase (PostgreSQL + Auth) og Vercel-hosting.

- Repo: https://github.com/1-fredrikstad/1sang
- Frontend ligger i `frontend/`-mappen

---

## Innholdsfortegnelse

1. [Supabase-oppsett](#1-supabase-oppsett)
2. [Google OAuth](#2-google-oauth)
3. [Vercel-oppsett](#3-vercel-oppsett)
4. [Domeneoppsett](#4-domeneoppsett-domeneshop--vercel)
5. [Seed sanger](#5-seed-sanger)
6. [Sett deg selv som admin](#6-sett-deg-selv-som-admin)
7. [Keep-alive workflow](#7-keep-alive-workflow)

---

## Hvorfor ikke GitHub Pages?

Appen bruker Next.js Server Actions, API-ruter og `@supabase/ssr`, som alle krever server-side rendering. GitHub Pages støtter kun statiske filer. Bruk **Vercel**.

---

## 1. Supabase-oppsett

### Opprett prosjekt

1. Gå til [supabase.com](https://supabase.com) og logg inn.
2. Klikk **New project**.
3. Velg region: **Frankfurt (eu-central-1)**.
4. Vent til prosjektet er klart.

### Hent credentials

| Verdi | Sted i Supabase-dashbordet |
|---|---|
| Project URL | Integrations → Data API |
| Publishable Key | Project Settings → API Keys → *Legacy anon, service_role API keys* |
| Service Role Key | Project Settings → API Keys → *Legacy anon, service_role API keys* |

> **NB:** Service Role Key gir full tilgang — ikke eksponer den i frontend-kode.

### Opprett tabeller, RLS, funksjoner og triggere

All nødvendig SQL ligger i én fil: [`/supabase/migration.sql`](/supabase/migration.sql)

Gå til **SQL Editor**, åpne filen, kopier innholdet og lim inn alt på én gang. Filen inneholder tabeller, RLS-policies, grants, funksjoner og triggere i riktig rekkefølge.

> **Obs:** Etter seeding av sanger, husk å kjøre slug-oppdateringen (se kommentar nederst i filen).

<details>
<summary>Vis SQL-innholdet direkte her</summary>

Gå til **SQL Editor** og kjør følgende:

```sql
-- Sanger
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
alter table songs enable row level security;
create policy "Songs are publicly readable" on songs for select using (true);
alter table songs add constraint songs_title_unique unique (title);

-- Tagger
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);
alter table tags enable row level security;
create policy "Tags are publicly readable" on tags for select using (true);

-- Sang-tag-kobling
create table song_tags (
  song_id uuid references songs(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (song_id, tag_id)
);
alter table song_tags enable row level security;
create policy "Song tags are publicly readable" on song_tags for select using (true);

-- Sangforslag
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
alter table song_suggestions enable row level security;
create policy "Anyone can submit suggestions" on song_suggestions for insert with check (true);
create policy "Suggestions readable via API" on song_suggestions for select using (true);

-- Spillelister
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
alter table playlists enable row level security;
create policy "Public playlists are readable" on playlists for select using (is_public = true);
create policy "Anyone can create playlists" on playlists for insert with check (true);
create policy "Anyone can update playlists" on playlists for update using (true);
create policy "Anyone can delete playlists" on playlists for delete using (true);

-- Spillelisteelementer
create table playlist_items (
  playlist_id uuid references playlists(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  position int not null,
  primary key (playlist_id, song_id)
);
alter table playlist_items enable row level security;
create policy "Items from public playlists are readable" on playlist_items
  for select using (
    exists (select 1 from playlists where id = playlist_id and is_public = true)
  );
create policy "Anyone can manage playlist items" on playlist_items for all using (true) with check (true);

-- Brukere (alle innloggede)
create table users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  role text,
  email text,
  name text
);
alter table users enable row level security;
-- Ingen anonym tilgang — kun service_role
```

</details>

> **Tips:** Etter at tabellene er opprettet, verifiser at RLS-policies faktisk ble opprettet. Kjør f.eks.:
> ```sql
> select * from pg_policies where tablename = 'songs';
> ```
> Hvis ingen rader returneres, mangler policies og SQL-en over må kjøres på nytt.

### Gi service_role tilgang (inkludert i migration.sql)

```sql
grant all on all tables in schema public to service_role;
```

### Gi anon og authenticated tilgang

RLS-policies alene er ikke nok — rollene trenger også eksplisitte tabellrettigheter. Kjør:

```sql
grant select on songs, tags, song_tags, playlists, playlist_items to anon;
grant select on song_suggestions, users to anon, authenticated;
grant select on songs, tags, song_tags, playlists, playlist_items, users to authenticated;
grant insert on song_suggestions to anon;
grant insert, update, delete on playlists, playlist_items to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
```

### Opprett funksjoner og triggere

Kjør disse **hver for seg** i SQL Editor:

```sql
-- Slugify (støtter norske tegn)
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
```

```sql
-- Oppdater updated_at automatisk
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_songs_updated_at before update on songs
  for each row execute function set_updated_at();

create trigger trg_playlists_updated_at before update on playlists
  for each row execute function set_updated_at();
```

```sql
-- Legg til bruker i users-tabellen ved første innlogging
-- NB: role må settes til 'regular' slik at brukeren vises riktig i admin-UI
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

create or replace trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
```

Hvis du allerede har brukere i databasen med `role = null`, fiks dem med:

```sql
update users set role = 'regular' where role is null;
```

```sql
-- Rydd opp utløpte spillelister
create or replace function cleanup_expired_playlists() returns void language plpgsql as $$
begin
  delete from playlists where expires_at is not null and expires_at < now();
end; $$;
```

```sql
-- RPC: Opprett spilleliste
create or replace function playlists_create(
  p_title text, p_password text, p_is_public boolean, p_expires_at timestamptz
) returns playlists language plpgsql as $$
declare v_row public.playlists;
begin
  insert into public.playlists (title, playlist_password, is_public, expires_at)
  values (p_title, crypt(p_password, gen_salt('bf')), p_is_public, p_expires_at)
  returning * into v_row;
  return v_row;
end; $$;
```

```sql
-- RPC: Legg til sang i spilleliste (med passord)
create or replace function playlists_add_item(
  p_playlist_id uuid, p_password text, p_song_id uuid
) returns void language plpgsql as $$
declare
  v_hash text;
  v_next_pos int;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null or crypt(p_password, v_hash) <> v_hash then
    raise exception 'Invalid password';
  end if;
  select coalesce(max(position), 0) + 1 into v_next_pos
  from public.playlist_items where playlist_id = p_playlist_id;
  insert into public.playlist_items (playlist_id, song_id, position)
  values (p_playlist_id, p_song_id, v_next_pos)
  on conflict (playlist_id, song_id) do update set position = excluded.position;
  update public.playlists set version = version + 1 where id = p_playlist_id;
end; $$;
```

```sql
-- RPC: Legg til sang (admin, uten passord)
create or replace function playlists_admin_add_item(
  p_playlist_id uuid, p_song_id uuid
) returns void language plpgsql as $$
declare v_next_pos int;
begin
  select coalesce(max(position), 0) + 1 into v_next_pos
  from public.playlist_items where playlist_id = p_playlist_id;
  insert into public.playlist_items (playlist_id, song_id, position)
  values (p_playlist_id, p_song_id, v_next_pos)
  on conflict (playlist_id, song_id) do update set position = excluded.position;
  update public.playlists set version = version + 1 where id = p_playlist_id;
end; $$;
```

```sql
-- RPC: Fjern sang fra spilleliste (med passord)
create or replace function playlists_remove_item(
  p_playlist_id uuid, p_password text, p_song_id uuid
) returns void language plpgsql as $$
declare v_hash text;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null or crypt(p_password, v_hash) <> v_hash then
    raise exception 'Invalid password';
  end if;
  delete from public.playlist_items where playlist_id = p_playlist_id and song_id = p_song_id;
  update public.playlists set version = version + 1 where id = p_playlist_id;
end; $$;
```

```sql
-- RPC: Fjern sang (admin)
create or replace function playlists_admin_remove_item(
  p_playlist_id uuid, p_song_id uuid
) returns void language plpgsql as $$
begin
  delete from public.playlist_items where playlist_id = p_playlist_id and song_id = p_song_id;
  update public.playlists set version = version + 1 where id = p_playlist_id;
end; $$;
```

```sql
-- RPC: Slett spilleliste (med passord)
create or replace function playlists_delete(
  p_playlist_id uuid, p_password text
) returns void language plpgsql as $$
declare v_hash text;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null or crypt(p_password, v_hash) <> v_hash then
    raise exception 'Invalid password';
  end if;
  delete from public.playlists where id = p_playlist_id;
end; $$;
```

```sql
-- RPC: Slett spilleliste (admin)
create or replace function playlists_admin_delete(
  p_playlist_id uuid
) returns void language plpgsql as $$
begin
  delete from public.playlists where id = p_playlist_id;
end; $$;
```

```sql
-- RPC: Oppdater spilleliste (med passord)
create or replace function playlists_update(
  p_playlist_id uuid, p_current_password text, p_new_password text,
  p_title text, p_is_public boolean, p_expires_at timestamptz
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
```

```sql
-- RPC: Oppdater spilleliste (admin)
create or replace function playlists_admin_update(
  p_playlist_id uuid, p_new_password text,
  p_title text, p_is_public boolean, p_expires_at timestamptz
) returns playlists language plpgsql as $$
declare v_row public.playlists;
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
```

```sql
-- RPC: Hent detaljer for en spilleliste
create or replace function playlists_get_detail(p_playlist_id uuid)
returns table(id uuid, title text, is_public boolean, expires_at timestamptz,
  created_at timestamptz, updated_at timestamptz, version int, has_password boolean)
language sql as $$
  select p.id, p.title, p.is_public, p.expires_at, p.created_at, p.updated_at, p.version,
    (p.playlist_password is not null and btrim(p.playlist_password) <> '') as has_password
  from public.playlists p where p.id = p_playlist_id;
$$;
```

```sql
-- RPC: List offentlige spillelister
create or replace function playlists_list_public()
returns table(id uuid, title text, is_public boolean, expires_at timestamptz,
  created_at timestamptz, updated_at timestamptz, version int, has_password boolean)
language sql as $$
  select p.id, p.title, p.is_public, p.expires_at, p.created_at, p.updated_at, p.version,
    (p.playlist_password is not null and btrim(p.playlist_password) <> '') as has_password
  from public.playlists p where p.is_public = true;
$$;
```

```sql
-- RPC: Verifiser spillelistepassord
create or replace function playlists_verify_password(p_playlist_id uuid, p_password text)
returns boolean language plpgsql as $$
declare v_hash text;
begin
  select playlist_password into v_hash from public.playlists where id = p_playlist_id;
  if v_hash is null then return false; end if;
  return crypt(p_password, v_hash) = v_hash;
end; $$;
```

---

## 2. Google OAuth

### Google Cloud Console

1. Gå til [console.cloud.google.com](https://console.cloud.google.com).
2. Opprett nytt prosjekt: **APIs & Services** → **New Project**.
3. Gå til **APIs & Services** → **OAuth consent screen** → **Get started**, fyll inn nødvendig informasjon og opprett.
4. Gå til **Credentials** → **Create Credentials** → **OAuth Client ID** → velg **Web application**.
5. Under **Authorized redirect URIs**, legg til:
   ```
   https://<ditt-supabase-ref>.supabase.co/auth/v1/callback
   ```
   Erstatt `<ditt-supabase-ref>` med din faktiske Supabase-prosjektreferanse (finnes i prosjektets URL).
6. Kopier **Client ID** og **Client Secret**.

### Konfigurer i Supabase

1. Gå til **Authentication** → **Sign in / Providers** → **Google** → aktiver.
2. Lim inn **Client ID** og **Client Secret** → **Save**.
3. Gå til **Authentication** → **URL Configuration**:
   - **Site URL**: `https://1sang.no`
   - **Redirect URLs**: legg til `https://1sang.no/**` og `https://www.1sang.no/**`

---

## 3. Vercel-oppsett

1. Gå til [vercel.com](https://vercel.com) → **Add New Project**.
2. Importer repoet fra GitHub (`1-fredrikstad/1sang`).
3. Sett **Root Directory** til `frontend`.
4. Under **Environment Variables**, legg til:

   | Variabel | Verdi |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL fra Supabase |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable Key fra Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key fra Supabase |

5. Klikk **Deploy**.

> Vercel oppdager automatisk at det er et Next.js-prosjekt og bruker riktige byggeinnstillinger.

---

## 4. Domeneoppsett (Domeneshop + Vercel)

1. I Vercel: gå til prosjektet → **Settings** → **Domains**.
   - Legg til `1sang.no`
   - Legg til `www.1sang.no`
   - Vercel viser hvilke nameservere du skal bruke.

2. I [Domeneshop](https://domeneshop.no): gå til **Mine domener** → **1sang.no** → **DNS** (kalles **Navnepeker** i Domeneshop-grensesnittet).
   - Bytt nameservere til Vercels nameservere (typisk `ns1.vercel-dns.com` og `ns2.vercel-dns.com`).

3. DNS-propagering tar vanligvis 1-24 timer. Sjekk status på [whatsmydns.net](https://whatsmydns.net).

---

## 5. Seed sanger

Sett opp `.env.local` i `frontend/`-mappen med Supabase-credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ditt-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<din-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<din-service-role-key>
```

Kjor deretter seed-skriptet:

```bash
cd frontend
pnpm run seed:songs ../sanger.json
```

> **NB:** `sanger.json` er ikke inkludert i repoet av opphavsrettslige grunner. Ta kontakt med forrige vedlikeholder for å fa filen.

> **pnpm ikke i PATH?** Hvis `pnpm` ikke finnes i terminalen etter installasjon, bruk full sti:
> ```bash
> /home/<brukernavn>/.local/share/pnpm/bin/pnpm run seed:songs ../sanger.json
> ```

> **NB:** Seed-skriptet bruker `onConflict: 'title'`, som krever at `songs_title_unique`-constraint eksisterer. Denne er inkludert i SQL-en over. Mangler den, legg den til med:
> ```sql
> alter table songs add constraint songs_title_unique unique (title);
> ```

---

## 6. Sett deg selv som admin

Rekkefølgen her er viktig:

1. Deploy til Vercel først (se steg 3).
2. Gå til appen og logg inn med Google via `/admin`.
3. Åpne Supabase → **Table Editor** → `users`.
4. Finn raden med din e-postadresse.
5. Sett feltet `role` til `superuser`.
6. Oppdater admin-siden — du ser nå seksjonen "Brukerroller".
7. Andre brukere som logger inn får automatisk rollen `regular`.
8. Gi dem rollen `admin` via admin-UI-et ved behov.

---

## 7. Keep-alive workflow

Filen `.github/workflows/keep-alive.yml` pinger appen automatisk hvert 3. dag for å hindre at Supabase-prosjektet settes pa pause (gratisplanen pauser etter 1 uke uten aktivitet).

Kontroller at URL-en i den filen peker til ditt deployede domene (f.eks. `https://1sang.no`) og ikke et gammelt Vercel-domene som `sangerunderliljen.vercel.app`.

---

## Oppsummering av steg

| # | Steg | Verktoy |
|---|---|---|
| 1 | Opprett Supabase-prosjekt og kjoer SQL-migrasjonene | supabase.com |
| 2 | Sett opp Google OAuth og konfigurer i Supabase | Google Cloud Console + Supabase |
| 3 | Deploy frontend til Vercel med env-variabler | vercel.com |
| 4 | Pek domenet mot Vercel via Domeneshop | Domeneshop |
| 5 | Seed sangedatabasen | Terminal |
| 6 | Deploy først, logg inn, sett deg selv som `superuser` | Vercel + Supabase Table Editor |
| 7 | Verifiser keep-alive workflow peker til riktig domene | GitHub |
