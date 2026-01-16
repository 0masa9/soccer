"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FormState = {
  ok: boolean;
  message?: string;
};

const teamSchema = z.object({
  name: z.string().min(1, "チーム名を入力してください"),
  country: z.string().min(1, "国名を入力してください"),
  stadium_name: z.string().min(1, "スタジアム名を入力してください"),
  stadium_city: z.string().optional(),
});

export async function createTeam(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    country: formData.get("country"),
    stadium_name: formData.get("stadium_name"),
    stadium_city: formData.get("stadium_city"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("teams").insert({
    ...parsed.data,
    stadium_city: parsed.data.stadium_city || null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/teams");
  revalidatePath("/leagues");
  revalidatePath("/tournaments");
  return { ok: true, message: "チームを登録しました。" };
}

export async function updateTeam(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { ok: false, message: "対象チームが見つかりません。" };
  }

  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    country: formData.get("country"),
    stadium_name: formData.get("stadium_name"),
    stadium_city: formData.get("stadium_city"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("teams")
    .update({
      ...parsed.data,
      stadium_city: parsed.data.stadium_city || null,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/teams");
  revalidatePath("/leagues");
  revalidatePath("/tournaments");
  return { ok: true, message: "チームを更新しました。" };
}

export async function deleteTeam(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("teams").delete().eq("id", id);

  revalidatePath("/teams");
  revalidatePath("/leagues");
  revalidatePath("/tournaments");
}
