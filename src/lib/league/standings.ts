import type { Match, PointRule, Team } from "@/lib/types";
import { calculateMatchPoints } from "./points";

export type StandingRow = {
  team_id: string;
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
};

type TeamMap = Record<string, StandingRow>;

export function calculateStandings(
  teams: Team[],
  matches: Match[],
  rule: PointRule,
): StandingRow[] {
  // Aggregate played matches into a table and sort by configured tiebreakers.
  const table: TeamMap = {};

  teams.forEach((team) => {
    table[team.id] = {
      team_id: team.id,
      team_name: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_diff: 0,
      points: 0,
    };
  });

  matches
    .filter((match) => match.status === "played")
    .forEach((match) => {
      const home = table[match.home_team_id];
      const away = table[match.away_team_id];

      if (!home || !away) {
        return;
      }

      const homeGoals = match.score_home ?? 0;
      const awayGoals = match.score_away ?? 0;
      const points = calculateMatchPoints(match, rule);

      home.played += 1;
      away.played += 1;
      home.goals_for += homeGoals;
      home.goals_against += awayGoals;
      away.goals_for += awayGoals;
      away.goals_against += homeGoals;
      home.points += points.homePoints;
      away.points += points.awayPoints;

      if (homeGoals > awayGoals) {
        home.wins += 1;
        away.losses += 1;
      } else if (awayGoals > homeGoals) {
        away.wins += 1;
        home.losses += 1;
      } else if (
        rule.pk.enabled &&
        match.went_to_pk &&
        typeof match.pk_home === "number" &&
        typeof match.pk_away === "number"
      ) {
        if (match.pk_home > match.pk_away) {
          home.wins += 1;
          away.losses += 1;
        } else if (match.pk_away > match.pk_home) {
          away.wins += 1;
          home.losses += 1;
        } else {
          home.draws += 1;
          away.draws += 1;
        }
      } else {
        home.draws += 1;
        away.draws += 1;
      }

      home.goal_diff = home.goals_for - home.goals_against;
      away.goal_diff = away.goals_for - away.goals_against;
    });

  const rows = Object.values(table);

  const compareBy = (a: StandingRow, b: StandingRow) => {
    for (const key of rule.tiebreakers) {
      if (key === "points" && a.points !== b.points) {
        return b.points - a.points;
      }
      if (key === "goal_diff" && a.goal_diff !== b.goal_diff) {
        return b.goal_diff - a.goal_diff;
      }
      if (key === "goals_for" && a.goals_for !== b.goals_for) {
        return b.goals_for - a.goals_for;
      }
    }

    return a.team_name.localeCompare(b.team_name);
  };

  return rows.sort(compareBy);
}
