create extension if not exists "pgcrypto";

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  stadium_name text not null,
  stadium_city text,
  created_at timestamptz not null default now()
);

create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season_label text not null,
  country text,
  point_rule jsonb not null default '{
    "regulation": { "win": 3, "draw": 1, "loss": 0 },
    "pk": {
      "enabled": false,
      "draw_to_pk": false,
      "pk_win_points": 2,
      "pk_loss_points": 1
    },
    "tiebreakers": ["points", "goal_diff", "goals_for"]
  }'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists league_teams (
  league_id uuid not null references leagues(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (league_id, team_id)
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season_label text not null,
  format text not null default 'single_elim',
  created_at timestamptz not null default now(),
  constraint tournaments_format_check check (format in ('single_elim'))
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  competition_type text not null,
  league_id uuid references leagues(id) on delete cascade,
  tournament_id uuid references tournaments(id) on delete cascade,
  home_team_id uuid not null references teams(id) on delete restrict,
  away_team_id uuid not null references teams(id) on delete restrict,
  kickoff_date date,
  status text not null default 'scheduled',
  score_home integer,
  score_away integer,
  went_to_pk boolean not null default false,
  pk_home integer,
  pk_away integer,
  notes text,
  created_at timestamptz not null default now(),
  constraint matches_competition_check check (competition_type in ('league', 'tournament')),
  constraint matches_status_check check (status in ('scheduled', 'played')),
  constraint matches_competition_fk check (
    (competition_type = 'league' and league_id is not null and tournament_id is null)
    or (competition_type = 'tournament' and tournament_id is not null and league_id is null)
  )
);

create table if not exists tournament_entries (
  tournament_id uuid not null references tournaments(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tournament_id, team_id)
);

create table if not exists tournament_rounds (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round_no integer not null,
  bye_team_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  unique (tournament_id, round_no)
);

alter table tournament_rounds
  add column if not exists bye_team_ids uuid[] not null default '{}'::uuid[];

create table if not exists tournament_round_matches (
  round_id uuid not null references tournament_rounds(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (round_id, match_id)
);

create index if not exists matches_league_id_idx on matches(league_id);
create index if not exists matches_tournament_id_idx on matches(tournament_id);
create index if not exists league_teams_team_id_idx on league_teams(team_id);
create index if not exists tournament_entries_team_id_idx on tournament_entries(team_id);

alter table teams enable row level security;
alter table leagues enable row level security;
alter table league_teams enable row level security;
alter table matches enable row level security;
alter table tournaments enable row level security;
alter table tournament_entries enable row level security;
alter table tournament_rounds enable row level security;
alter table tournament_round_matches enable row level security;

drop policy if exists "public_select_teams" on teams;
drop policy if exists "public_insert_teams" on teams;
drop policy if exists "public_update_teams" on teams;
drop policy if exists "public_delete_teams" on teams;
create policy "public_select_teams" on teams for select using (true);
create policy "public_insert_teams" on teams for insert with check (true);
create policy "public_update_teams" on teams for update using (true) with check (true);
create policy "public_delete_teams" on teams for delete using (true);

drop policy if exists "public_select_leagues" on leagues;
drop policy if exists "public_insert_leagues" on leagues;
drop policy if exists "public_update_leagues" on leagues;
drop policy if exists "public_delete_leagues" on leagues;
create policy "public_select_leagues" on leagues for select using (true);
create policy "public_insert_leagues" on leagues for insert with check (true);
create policy "public_update_leagues" on leagues for update using (true) with check (true);
create policy "public_delete_leagues" on leagues for delete using (true);

drop policy if exists "public_select_league_teams" on league_teams;
drop policy if exists "public_insert_league_teams" on league_teams;
drop policy if exists "public_delete_league_teams" on league_teams;
create policy "public_select_league_teams" on league_teams for select using (true);
create policy "public_insert_league_teams" on league_teams for insert with check (true);
create policy "public_delete_league_teams" on league_teams for delete using (true);

drop policy if exists "public_select_matches" on matches;
drop policy if exists "public_insert_matches" on matches;
drop policy if exists "public_update_matches" on matches;
drop policy if exists "public_delete_matches" on matches;
create policy "public_select_matches" on matches for select using (true);
create policy "public_insert_matches" on matches for insert with check (true);
create policy "public_update_matches" on matches for update using (true) with check (true);
create policy "public_delete_matches" on matches for delete using (true);

drop policy if exists "public_select_tournaments" on tournaments;
drop policy if exists "public_insert_tournaments" on tournaments;
drop policy if exists "public_update_tournaments" on tournaments;
drop policy if exists "public_delete_tournaments" on tournaments;
create policy "public_select_tournaments" on tournaments for select using (true);
create policy "public_insert_tournaments" on tournaments for insert with check (true);
create policy "public_update_tournaments" on tournaments for update using (true) with check (true);
create policy "public_delete_tournaments" on tournaments for delete using (true);

drop policy if exists "public_select_tournament_entries" on tournament_entries;
drop policy if exists "public_insert_tournament_entries" on tournament_entries;
drop policy if exists "public_delete_tournament_entries" on tournament_entries;
create policy "public_select_tournament_entries" on tournament_entries for select using (true);
create policy "public_insert_tournament_entries" on tournament_entries for insert with check (true);
create policy "public_delete_tournament_entries" on tournament_entries for delete using (true);

drop policy if exists "public_select_tournament_rounds" on tournament_rounds;
drop policy if exists "public_insert_tournament_rounds" on tournament_rounds;
drop policy if exists "public_update_tournament_rounds" on tournament_rounds;
drop policy if exists "public_delete_tournament_rounds" on tournament_rounds;
create policy "public_select_tournament_rounds" on tournament_rounds for select using (true);
create policy "public_insert_tournament_rounds" on tournament_rounds for insert with check (true);
create policy "public_update_tournament_rounds" on tournament_rounds for update using (true) with check (true);
create policy "public_delete_tournament_rounds" on tournament_rounds for delete using (true);

drop policy if exists "public_select_tournament_round_matches" on tournament_round_matches;
drop policy if exists "public_insert_tournament_round_matches" on tournament_round_matches;
drop policy if exists "public_delete_tournament_round_matches" on tournament_round_matches;
create policy "public_select_tournament_round_matches" on tournament_round_matches for select using (true);
create policy "public_insert_tournament_round_matches" on tournament_round_matches for insert with check (true);
create policy "public_delete_tournament_round_matches" on tournament_round_matches for delete using (true);
