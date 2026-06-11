-- =========================================================
-- Emerging Artists Weekly — schema di riferimento
-- (gia applicato sul progetto Supabase tramite migrazioni)
-- =========================================================

create table playlists (
  id uuid primary key default gen_random_uuid(),
  settimana date not null unique, -- lunedi di riferimento
  titolo text,
  created_at timestamptz default now()
);

create table artisti (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade,
  nome text not null,
  citta text,
  genere text,
  youtube_url text not null,
  youtube_video_id text not null,
  copertina_url text,
  scheda_editoriale text,
  ordine integer not null,
  created_at timestamptz default now()
);
create index artisti_playlist_id_idx on artisti(playlist_id);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  artista_id uuid references artisti(id) on delete cascade,
  tipo text not null check (tipo in ('ascolto', 'like')),
  created_at timestamptz default now()
);
create index feedback_artista_id_idx on feedback(artista_id);

create view artisti_con_contatori
with (security_invoker = on) as
select
  a.*,
  count(f.id) filter (where f.tipo = 'ascolto') as ascolti,
  count(f.id) filter (where f.tipo = 'like') as like_count
from artisti a
left join feedback f on f.artista_id = a.id
group by a.id;

-- RLS
alter table playlists enable row level security;
create policy "Lettura pubblica playlists" on playlists for select using (true);

alter table artisti enable row level security;
create policy "Lettura pubblica artisti" on artisti for select using (true);

alter table feedback enable row level security;
create policy "Inserimento anonimo feedback"
  on feedback for insert with check (tipo in ('ascolto', 'like'));
create policy "Lettura pubblica feedback" on feedback for select using (true);
