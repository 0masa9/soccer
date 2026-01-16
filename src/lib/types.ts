export type Team = {
  id: string;
  name: string;
  country: string;
  stadium_name: string;
  stadium_city: string | null;
  created_at: string;
};

export type League = {
  id: string;
  name: string;
  season_label: string;
  country: string | null;
  point_rule: PointRule;
  created_at: string;
};

export type LeagueTeam = {
  league_id: string;
  team_id: string;
  created_at: string;
};

export type Match = {
  id: string;
  competition_type: "league" | "tournament";
  league_id: string | null;
  tournament_id: string | null;
  home_team_id: string;
  away_team_id: string;
  kickoff_date: string | null;
  status: "scheduled" | "played";
  score_home: number | null;
  score_away: number | null;
  went_to_pk: boolean;
  pk_home: number | null;
  pk_away: number | null;
  notes: string | null;
  created_at: string;
};

export type Tournament = {
  id: string;
  name: string;
  season_label: string;
  format: "single_elim";
  created_at: string;
};

export type TournamentEntry = {
  tournament_id: string;
  team_id: string;
  created_at: string;
};

export type TournamentRound = {
  id: string;
  tournament_id: string;
  round_no: number;
  bye_team_ids: string[];
  created_at: string;
};

export type TournamentRoundMatch = {
  round_id: string;
  match_id: string;
  created_at: string;
};

export type PointRule = {
  regulation: {
    win: number;
    draw: number;
    loss: number;
  };
  pk: {
    enabled: boolean;
    draw_to_pk: boolean;
    pk_win_points: number;
    pk_loss_points: number;
  };
  tiebreakers: Array<"points" | "goal_diff" | "goals_for" | "head_to_head">;
};
