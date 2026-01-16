"use client";

import { useActionState } from "react";

import { FormError } from "@/components/form/form-error";
import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeam, updateTeam, type FormState } from "./actions";
import type { Team } from "@/lib/types";

const initialState: FormState = { ok: true, message: "" };

export function TeamCreateForm() {
  const [state, formAction] = useActionState(createTeam, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="team-name">チーム名</Label>
          <Input id="team-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team-country">国</Label>
          <Input id="team-country" name="country" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stadium-name">スタジアム名</Label>
          <Input id="stadium-name" name="stadium_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stadium-city">都市（任意）</Label>
          <Input id="stadium-city" name="stadium_city" />
        </div>
      </div>
      <FormError message={!state.ok ? state.message : undefined} />
      <SubmitButton variant="outline">チームを追加</SubmitButton>
    </form>
  );
}

export function TeamEditForm({ team }: { team: Team }) {
  const [state, formAction] = useActionState(updateTeam, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={team.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`team-name-${team.id}`}>チーム名</Label>
          <Input
            id={`team-name-${team.id}`}
            name="name"
            defaultValue={team.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`team-country-${team.id}`}>国</Label>
          <Input
            id={`team-country-${team.id}`}
            name="country"
            defaultValue={team.country}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`stadium-name-${team.id}`}>スタジアム名</Label>
          <Input
            id={`stadium-name-${team.id}`}
            name="stadium_name"
            defaultValue={team.stadium_name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`stadium-city-${team.id}`}>都市（任意）</Label>
          <Input
            id={`stadium-city-${team.id}`}
            name="stadium_city"
            defaultValue={team.stadium_city ?? ""}
          />
        </div>
      </div>
      <FormError message={!state.ok ? state.message : undefined} />
      <SubmitButton variant="outline">更新</SubmitButton>
    </form>
  );
}
