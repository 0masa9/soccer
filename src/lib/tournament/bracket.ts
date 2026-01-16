import type { Match } from "@/lib/types";

export type RoundPairing = {
  home: string;
  away: string;
};

export type RoundBuild = {
  pairs: RoundPairing[];
  byes: string[];
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildSingleElimRound(teamIds: string[]): RoundBuild {
  const shuffled = shuffle(teamIds);
  const pairs: RoundPairing[] = [];
  const byes: string[] = [];

  if (shuffled.length % 2 === 1) {
    const byeTeam = shuffled.pop();
    if (byeTeam) {
      byes.push(byeTeam);
    }
  }

  for (let i = 0; i < shuffled.length; i += 2) {
    pairs.push({ home: shuffled[i], away: shuffled[i + 1] });
  }

  return { pairs, byes };
}

export function getMatchWinnerId(match: Match): string | null {
  if (match.status !== "played") {
    return null;
  }

  const scoreHome = match.score_home ?? 0;
  const scoreAway = match.score_away ?? 0;

  if (scoreHome > scoreAway) {
    return match.home_team_id;
  }

  if (scoreAway > scoreHome) {
    return match.away_team_id;
  }

  if (
    match.went_to_pk &&
    typeof match.pk_home === "number" &&
    typeof match.pk_away === "number"
  ) {
    if (match.pk_home > match.pk_away) {
      return match.home_team_id;
    }
    if (match.pk_away > match.pk_home) {
      return match.away_team_id;
    }
  }

  return null;
}

export function deriveRoundWinners(
  matches: Match[],
  byeTeamIds: string[],
): string[] {
  // Decide who advances from a round using match winners + bye teams.
  const winners = matches
    .map((match) => getMatchWinnerId(match))
    .filter((id): id is string => Boolean(id));

  return [...winners, ...byeTeamIds];
}
