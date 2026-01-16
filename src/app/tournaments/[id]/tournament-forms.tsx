"use client";

import { useActionState } from "react";

import { FormError } from "@/components/form/form-error";
import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Match, Team } from "@/lib/types";
import {
  addTournamentEntry,
  generateNextRound,
  updateTournamentMatch,
  type FormState,
} from "./actions";

const initialState: FormState = { ok: true, message: "" };

type TeamOption = Pick<Team, "id" | "name">;

export function TournamentEntryForm({
  tournamentId,
  options,
}: {
  tournamentId: string;
  options: TeamOption[];
}) {
  const [state, formAction] = useActionState(addTournamentEntry, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="tournament_id" value={tournamentId} />
      <div className="space-y-2">
        <Label htmlFor="entry-team">参加チーム</Label>
        <Select id="entry-team" name="team_id" defaultValue="" required>
          <option value="" disabled>
            チームを選択
          </option>
          {options.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </Select>
      </div>
      <FormError message={!state.ok ? state.message : undefined} />
      <SubmitButton variant="outline">追加</SubmitButton>
    </form>
  );
}

export function TournamentRoundForm({ tournamentId }: { tournamentId: string }) {
  const [state, formAction] = useActionState(generateNextRound, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="tournament_id" value={tournamentId} />
      <SubmitButton variant="outline">次のラウンドを生成</SubmitButton>
      <FormError message={!state.ok ? state.message : undefined} />
    </form>
  );
}

export function TournamentMatchResultForm({ match }: { match: Match }) {
  const [state, formAction] = useActionState(updateTournamentMatch, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="match_id" value={match.id} />
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`status-${match.id}`}>ステータス</Label>
          <Select
            id={`status-${match.id}`}
            name="status"
            defaultValue={match.status}
          >
            <option value="scheduled">scheduled</option>
            <option value="played">played</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`score-home-${match.id}`}>ホーム得点</Label>
          <Input
            id={`score-home-${match.id}`}
            name="score_home"
            type="number"
            min="0"
            defaultValue={match.score_home ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`score-away-${match.id}`}>アウェイ得点</Label>
          <Input
            id={`score-away-${match.id}`}
            name="score_away"
            type="number"
            min="0"
            defaultValue={match.score_away ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          <input type="checkbox" name="went_to_pk" defaultChecked={match.went_to_pk} />
          PKあり
        </label>
        <div className="space-y-2">
          <Label htmlFor={`pk-home-${match.id}`}>PKホーム</Label>
          <Input
            id={`pk-home-${match.id}`}
            name="pk_home"
            type="number"
            min="0"
            defaultValue={match.pk_home ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`pk-away-${match.id}`}>PKアウェイ</Label>
          <Input
            id={`pk-away-${match.id}`}
            name="pk_away"
            type="number"
            min="0"
            defaultValue={match.pk_away ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`notes-${match.id}`}>メモ（任意）</Label>
        <Textarea id={`notes-${match.id}`} name="notes" defaultValue={match.notes ?? ""} />
      </div>
      <FormError message={!state.ok ? state.message : undefined} />
      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton variant="outline">保存</SubmitButton>
        <Button type="reset" variant="ghost" size="sm">
          リセット
        </Button>
      </div>
    </form>
  );
}
