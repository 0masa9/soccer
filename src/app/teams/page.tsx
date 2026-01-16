import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Team } from "@/lib/types";
import { deleteTeam } from "./actions";
import { TeamCreateForm, TeamEditForm } from "./team-forms";

export default async function TeamsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });

  const teams = (data ?? []) as Team[];

  return (
    <section className="space-y-8 reveal">
      <header className="space-y-2">
        <p className="section-eyebrow">Teams</p>
        <h1 className="section-title">チーム管理</h1>
        <p className="text-sm text-[var(--muted)]">
          国・スタジアム情報を登録してリーグ/トーナメントの基盤を作ります。
        </p>
      </header>

      <div className="surface space-y-4">
        <h2 className="text-base font-semibold">新規チーム</h2>
        <TeamCreateForm />
      </div>

      <div className="surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">登録済みチーム</h2>
          <p className="text-xs text-[var(--muted)]">
            {teams.length} チーム
          </p>
        </div>

        {error ? (
          <p className="text-sm text-[var(--accent)]">
            読み込みに失敗しました: {error.message}
          </p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            まだチームがありません。上のフォームから追加してください。
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>チーム</TableHead>
                <TableHead>国</TableHead>
                <TableHead>スタジアム</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-semibold">{team.name}</TableCell>
                  <TableCell>{team.country}</TableCell>
                  <TableCell>
                    {team.stadium_name}
                    {team.stadium_city ? ` (${team.stadium_city})` : ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <details className="group">
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-2)]">
                          編集
                        </summary>
                        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                          <TeamEditForm team={team} />
                        </div>
                      </details>
                      <form action={deleteTeam}>
                        <input type="hidden" name="id" value={team.id} />
                        <Button variant="ghost" size="sm">
                          削除
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
