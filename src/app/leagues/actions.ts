"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { pointRuleSchema, defaultPointRule } from "@/lib/league/point-rule";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FormState = {
  ok: boolean;
  message?: string;
};

const leagueSchema = z.object({
  name: z.string().min(1, "リーグ名を入力してください"),
  season_label: z.string().min(1, "シーズン表記を入力してください"),
  country: z.string().optional(),
  point_rule: z.string().optional(),
});

function parsePointRule(input?: string | null) {
  if (!input) {
    return { data: defaultPointRule, error: null };
  }

  try {
    const json = JSON.parse(input);
    const parsed = pointRuleSchema.safeParse(json);
    if (!parsed.success) {
      return {
        data: defaultPointRule,
        error: "勝ち点ルールのJSON形式が正しくありません。",
      };
    }
    return { data: parsed.data, error: null };
  } catch {
    return {
      data: defaultPointRule,
      error: "勝ち点ルールのJSONをパースできませんでした。",
    };
  }
}

export async function createLeague(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = leagueSchema.safeParse({
    name: formData.get("name"),
    season_label: formData.get("season_label"),
    country: formData.get("country"),
    point_rule: formData.get("point_rule"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message };
  }

  const ruleResult = parsePointRule(parsed.data.point_rule);
  if (ruleResult.error) {
    return { ok: false, message: ruleResult.error };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("leagues").insert({
    name: parsed.data.name,
    season_label: parsed.data.season_label,
    country: parsed.data.country || null,
    point_rule: ruleResult.data,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/leagues");
  return { ok: true, message: "リーグを作成しました。" };
}

export async function deleteLeague(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("leagues").delete().eq("id", id);

  revalidatePath("/leagues");
}
