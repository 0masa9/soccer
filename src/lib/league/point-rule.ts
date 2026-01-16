import { z } from "zod";

import type { PointRule } from "@/lib/types";

export const defaultPointRule: PointRule = {
  regulation: { win: 3, draw: 1, loss: 0 },
  pk: {
    enabled: true,
    draw_to_pk: true,
    pk_win_points: 2,
    pk_loss_points: 1,
  },
  tiebreakers: ["points", "goal_diff", "goals_for"],
};

export const pointRuleSchema = z.object({
  regulation: z.object({
    win: z.number().int().nonnegative(),
    draw: z.number().int().nonnegative(),
    loss: z.number().int().nonnegative(),
  }),
  pk: z.object({
    enabled: z.boolean(),
    draw_to_pk: z.boolean(),
    pk_win_points: z.number().int().nonnegative(),
    pk_loss_points: z.number().int().nonnegative(),
  }),
  tiebreakers: z.array(
    z.enum(["points", "goal_diff", "goals_for", "head_to_head"]),
  ),
});

export function parsePointRule(input: unknown): PointRule {
  const result = pointRuleSchema.safeParse(input);
  if (result.success) {
    return result.data;
  }
  return defaultPointRule;
}
