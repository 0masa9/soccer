import type { Match, PointRule } from "@/lib/types";

export type MatchPoints = {
  homePoints: number;
  awayPoints: number;
};

export function calculateMatchPoints(
  match: Pick<
    Match,
    | "score_home"
    | "score_away"
    | "went_to_pk"
    | "pk_home"
    | "pk_away"
    | "status"
  >,
  rule: PointRule,
): MatchPoints {
  // Resolve points from regulation and optional PK rules for a single match.
  if (match.status !== "played") {
    return { homePoints: 0, awayPoints: 0 };
  }

  const scoreHome = match.score_home ?? 0;
  const scoreAway = match.score_away ?? 0;

  if (scoreHome > scoreAway) {
    return { homePoints: rule.regulation.win, awayPoints: rule.regulation.loss };
  }

  if (scoreAway > scoreHome) {
    return { homePoints: rule.regulation.loss, awayPoints: rule.regulation.win };
  }

  if (
    rule.pk.enabled &&
    match.went_to_pk &&
    typeof match.pk_home === "number" &&
    typeof match.pk_away === "number"
  ) {
    if (match.pk_home > match.pk_away) {
      return { homePoints: rule.pk.pk_win_points, awayPoints: rule.pk.pk_loss_points };
    }
    if (match.pk_away > match.pk_home) {
      return { homePoints: rule.pk.pk_loss_points, awayPoints: rule.pk.pk_win_points };
    }
  }

  return { homePoints: rule.regulation.draw, awayPoints: rule.regulation.draw };
}
