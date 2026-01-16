"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { buildSingleElimRound, deriveRoundWinners, getMatchWinnerId } from "@/lib/tournament/bracket";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Match } from "@/lib/types";

export type FormState = {
  ok: boolean;
  message?: string;
};

const entrySchema = z.object({
  tournament_id: z.string().uuid(),
  team_id: z.string().uuid(),
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

export async function addTournamentEntry(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = entrySchema.safeParse({
    tournament_id: formData.get("tournament_id"),
    team_id: formData.get("team_id"),
  });

  if (!parsed.success) {
    return { ok: false, message: "参加チームを選択してください。" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tournament_entries").insert({
    tournament_id: parsed.data.tournament_id,
    team_id: parsed.data.team_id,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/tournaments/${parsed.data.tournament_id}`);
  return { ok: true, message: "チームを追加しました。" };
}

export async function removeTournamentEntry(formData: FormData): Promise<void> {
  const tournament_id = formData.get("tournament_id");
  const team_id = formData.get("team_id");

  if (typeof tournament_id !== "string" || typeof team_id !== "string") {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("tournament_entries")
    .delete()
    .eq("tournament_id", tournament_id)
    .eq("team_id", team_id);

  revalidatePath(`/tournaments/${tournament_id}`);
}

export async function generateNextRound(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const tournament_id = formData.get("tournament_id");
  if (typeof tournament_id !== "string") {
    return { ok: false, message: "トーナメントIDが見つかりません。" };
  }

  const supabase = await createSupabaseServerClient();
  const { data: rounds } = await supabase
    .from("tournament_rounds")
    .select("*")
    .eq("tournament_id", tournament_id)
    .order("round_no", { ascending: false })
    .limit(1);

  const lastRound = rounds?.[0] ?? null;

  let teamsForRound: string[] = [];

  if (!lastRound) {
    const { data: entries } = await supabase
      .from("tournament_entries")
      .select("team_id")
      .eq("tournament_id", tournament_id);

    teamsForRound = (entries ?? []).map((entry) => entry.team_id);
  } else {
    const { data: roundMatches } = await supabase
      .from("tournament_round_matches")
      .select("match_id")
      .eq("round_id", lastRound.id);

    const matchIds = (roundMatches ?? []).map((row) => row.match_id);
    if (matchIds.length === 0) {
      return { ok: false, message: "このラウンドに試合がありません。" };
    }

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .in("id", matchIds);

    const matches = (matchesData ?? []) as Match[];

    const unresolved = matches.some((match) => getMatchWinnerId(match) === null);
    if (unresolved) {
      return { ok: false, message: "未確定の試合があります。結果を入力してください。" };
    }

    teamsForRound = deriveRoundWinners(matches, lastRound.bye_team_ids ?? []);
  }

  if (teamsForRound.length < 2) {
    return { ok: false, message: "次ラウンドを作るチームが不足しています。" };
  }

  const roundNo = lastRound ? lastRound.round_no + 1 : 1;
  const build = buildSingleElimRound(teamsForRound);

  const { data: round, error: roundError } = await supabase
    .from("tournament_rounds")
    .insert({
      tournament_id,
      round_no: roundNo,
      bye_team_ids: build.byes,
    })
    .select("*")
    .single();

  if (roundError || !round) {
    return { ok: false, message: roundError?.message ?? "ラウンド作成に失敗しました。" };
  }

  if (build.pairs.length === 0) {
    return { ok: false, message: "対戦カードが作れませんでした。" };
  }

  const matchRows = build.pairs.map((pair) => ({
    competition_type: "tournament",
    tournament_id,
    home_team_id: pair.home,
    away_team_id: pair.away,
    status: "scheduled",
  }));

  const { data: createdMatches, error: matchError } = await supabase
    .from("matches")
    .insert(matchRows)
    .select("id");

  if (matchError) {
    return { ok: false, message: matchError.message };
  }

  const roundMatchRows = (createdMatches ?? []).map((match) => ({
    round_id: round.id,
    match_id: match.id,
  }));

  const { error: roundMatchError } = await supabase
    .from("tournament_round_matches")
    .insert(roundMatchRows);

  if (roundMatchError) {
    return { ok: false, message: roundMatchError.message };
  }

  revalidatePath(`/tournaments/${tournament_id}`);
  return { ok: true, message: `Round ${roundNo} を生成しました。` };
}

export async function updateTournamentMatch(
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
    .select("tournament_id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/tournaments/${data.tournament_id}`);
  return { ok: true, message: "試合結果を更新しました。" };
}
