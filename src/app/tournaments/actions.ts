"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FormState = {
  ok: boolean;
  message?: string;
};

const tournamentSchema = z.object({
  name: z.string().min(1, "大会名を入力してください"),
  season_label: z.string().min(1, "シーズン表記を入力してください"),
});

export async function createTournament(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = tournamentSchema.safeParse({
    name: formData.get("name"),
    season_label: formData.get("season_label"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tournaments").insert({
    name: parsed.data.name,
    season_label: parsed.data.season_label,
    format: "single_elim",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/tournaments");
  return { ok: true, message: "トーナメントを作成しました。" };
}

export async function deleteTournament(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("tournaments").delete().eq("id", id);

  revalidatePath("/tournaments");
}
