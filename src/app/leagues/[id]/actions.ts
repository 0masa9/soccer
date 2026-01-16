"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FormState = {
  ok: boolean;
  message?: string;
};

const matchBaseSchema = z.object({
  league_id: z.string().uuid(),
  home_team_id: z.string().uuid(),
  away_team_id: z.string().uuid(),
  kickoff_date: z.string().optional(),
});

const resultSchema = z.object({
  match_id: z.string().uuid(),
  status: z.enum(["scheduled", "played"]),
  score_home: z.string().optional(),
  score_away: z.string().optional(),
  went_to_pk: z.string().optional(),
  pk_home: z.string().optional(),
  pk_away: z.string().optional(),
  notes: z.string().optional(),
});

function parseScore(value?: string | null) {
  if (!value) {
    return null;
  }
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export async function addLeagueTeam(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const league_id = formData.get("league_id");
  const team_id = formData.get("team_id");

  if (typeof league_id !== "string" || typeof team_id !== "string") {
    return { ok: false, message: "追加するチームを選択してください。" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("league_teams").insert({
    league_id,
    team_id,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/leagues/${league_id}`);
  return { ok: true, message: "リーグにチームを追加しました。" };
}

export async function removeLeagueTeam(
  formData: FormData,
): Promise<void> {
  const league_id = formData.get("league_id");
  const team_id = formData.get("team_id");

  if (typeof league_id !== "string" || typeof team_id !== "string") {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("league_teams")
    .delete()
    .eq("league_id", league_id)
    .eq("team_id", team_id);

  revalidatePath(`/leagues/${league_id}`);
}

export async function createLeagueMatch(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = matchBaseSchema.safeParse({
    league_id: formData.get("league_id"),
    home_team_id: formData.get("home_team_id"),
    away_team_id: formData.get("away_team_id"),
    kickoff_date: formData.get("kickoff_date") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "試合情報を入力してください。" };
  }

  if (parsed.data.home_team_id === parsed.data.away_team_id) {
    return { ok: false, message: "ホームとアウェイは別のチームにしてください。" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("matches").insert({
    competition_type: "league",
    league_id: parsed.data.league_id,
    home_team_id: parsed.data.home_team_id,
    away_team_id: parsed.data.away_team_id,
    kickoff_date: parsed.data.kickoff_date || null,
    status: "scheduled",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/leagues/${parsed.data.league_id}`);
  return { ok: true, message: "試合を追加しました。" };
}

export async function updateLeagueMatch(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resultSchema.safeParse({
    match_id: formData.get("match_id"),
    status: formData.get("status"),
    score_home: formData.get("score_home")?.toString(),
    score_away: formData.get("score_away")?.toString(),
    went_to_pk: formData.get("went_to_pk")?.toString(),
    pk_home: formData.get("pk_home")?.toString(),
    pk_away: formData.get("pk_away")?.toString(),
    notes: formData.get("notes")?.toString(),
  });

  if (!parsed.success) {
    return { ok: false, message: "試合結果の入力が不足しています。" };
  }

  const score_home = parseScore(parsed.data.score_home);
  const score_away = parseScore(parsed.data.score_away);
  const went_to_pk = parsed.data.went_to_pk === "on";
  const pk_home = parseScore(parsed.data.pk_home);
  const pk_away = parseScore(parsed.data.pk_away);

  if (parsed.data.status === "played") {
    if (score_home === null || score_away === null) {
      return { ok: false, message: "スコアを入力してください。" };
    }
    if (went_to_pk && (pk_home === null || pk_away === null)) {
      return { ok: false, message: "PKスコアを入力してください。" };
    }
  }

  const normalized =
    parsed.data.status === "played"
      ? {
          score_home,
          score_away,
          went_to_pk,
          pk_home,
          pk_away,
        }
      : {
          score_home: null,
          score_away: null,
          went_to_pk: false,
          pk_home: null,
          pk_away: null,
        };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("matches")
    .update({
      status: parsed.data.status,
      ...normalized,
      notes: parsed.data.notes || null,
    })
    .eq("id", parsed.data.match_id)
    .select("league_id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/leagues/${data.league_id}`);
  return { ok: true, message: "試合結果を更新しました。" };
}

export async function deleteLeagueMatch(formData: FormData): Promise<void> {
  const match_id = formData.get("match_id");
  if (typeof match_id !== "string") {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("matches")
    .delete()
    .eq("id", match_id)
    .select("league_id")
    .single();

  if (data?.league_id) {
    revalidatePath(`/leagues/${data.league_id}`);
  }
}
