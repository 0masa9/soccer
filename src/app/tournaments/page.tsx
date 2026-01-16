import Link from "next/link";

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
import type { Tournament } from "@/lib/types";
import { deleteTournament } from "./actions";
import { TournamentCreateForm } from "./tournament-form";

export default async function TournamentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });

  const tournaments = (data ?? []) as Tournament[];

  return (
    <section className="space-y-8 reveal">
      <header className="space-y-2">
        <p className="section-eyebrow">Tournaments</p>
        <h1 className="section-title">トーナメント管理</h1>
        <p className="text-sm text-[var(--muted)]">
          single elimination の大会を作成し、対戦カードと勝ち上がりを管理します。
        </p>
      </header>

      <div className="surface space-y-4">
        <h2 className="text-base font-semibold">新規トーナメント</h2>
        <TournamentCreateForm />
      </div>

      <div className="surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">登録済みトーナメント</h2>
          <p className="text-xs text-[var(--muted)]">
            {tournaments.length} 大会
          </p>
        </div>

        {error ? (
          <p className="text-sm text-[var(--accent)]">
            読み込みに失敗しました: {error.message}
          </p>
        ) : tournaments.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            まだトーナメントがありません。上のフォームから作成してください。
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>大会</TableHead>
                <TableHead>シーズン</TableHead>
                <TableHead>形式</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="font-semibold">
                    {tournament.name}
                  </TableCell>
                  <TableCell>{tournament.season_label}</TableCell>
                  <TableCell>{tournament.format}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/tournaments/${tournament.id}`}>
                        <Button size="sm" variant="outline">
                          詳細
                        </Button>
                      </Link>
                      <form action={deleteTournament}>
                        <input type="hidden" name="id" value={tournament.id} />
                        <Button size="sm" variant="ghost">
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
