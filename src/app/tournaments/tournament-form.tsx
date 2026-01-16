"use client";

import { useActionState } from "react";

import { FormError } from "@/components/form/form-error";
import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTournament, type FormState } from "./actions";

const initialState: FormState = { ok: true, message: "" };

export function TournamentCreateForm() {
  const [state, formAction] = useActionState(createTournament, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tournament-name">大会名</Label>
          <Input id="tournament-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tournament-season">シーズン表記</Label>
          <Input id="tournament-season" name="season_label" required />
        </div>
      </div>
      <FormError message={!state.ok ? state.message : undefined} />
      <SubmitButton variant="outline">トーナメントを作成</SubmitButton>
    </form>
  );
}
