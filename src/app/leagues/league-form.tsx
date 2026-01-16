"use client";

import { useActionState } from "react";

import { FormError } from "@/components/form/form-error";
import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { defaultPointRule } from "@/lib/league/point-rule";
import { createLeague, type FormState } from "./actions";

const initialState: FormState = { ok: true, message: "" };

const defaultRule = JSON.stringify(defaultPointRule, null, 2);

export function LeagueCreateForm() {
  const [state, formAction] = useActionState(createLeague, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="league-name">リーグ名</Label>
          <Input id="league-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="season-label">シーズン表記</Label>
          <Input id="season-label" name="season_label" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="league-country">国（任意）</Label>
          <Input id="league-country" name="country" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="point-rule">勝ち点ルール (JSON)</Label>
        <Textarea id="point-rule" name="point_rule" defaultValue={defaultRule} />
      </div>
      <FormError message={!state.ok ? state.message : undefined} />
      <SubmitButton variant="outline">リーグを作成</SubmitButton>
    </form>
  );
}
