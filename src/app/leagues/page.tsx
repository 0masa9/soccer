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
import type { League } from "@/lib/types";
import { deleteLeague } from "./actions";
import { LeagueCreateForm } from "./league-form";

export default async function LeaguesPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leagues")
    .select("*")
    .order("created_at", { ascending: false });

  const leagues = (data ?? []) as League[];

  return (
    <section className="space-y-8 reveal">
      <header className="space-y-2">
        <p className="section-eyebrow">Leagues</p>
        <h1 className="section-title">リーグ管理</h1>
        <p className="text-sm text-[var(--muted)]">
          勝ち点ルールを設定し、参加チームと試合結果で順位表を更新します。
        </p>
      </header>

      <div className="surface space-y-4">
        <h2 className="text-base font-semibold">新規リーグ</h2>
        <LeagueCreateForm />
      </div>

      <div className="surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">登録済みリーグ</h2>
          <p className="text-xs text-[var(--muted)]">
            {leagues.length} リーグ
          </p>
        </div>

        {error ? (
          <p className="text-sm text-[var(--accent)]">
            読み込みに失敗しました: {error.message}
          </p>
        ) : leagues.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            まだリーグがありません。上のフォームから作成してください。
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>リーグ</TableHead>
                <TableHead>シーズン</TableHead>
                <TableHead>国</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagues.map((league) => (
                <TableRow key={league.id}>
                  <TableCell className="font-semibold">{league.name}</TableCell>
                  <TableCell>{league.season_label}</TableCell>
                  <TableCell>{league.country ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/leagues/${league.id}`}>
                        <Button size="sm" variant="outline">
                          詳細
                        </Button>
                      </Link>
                      <form action={deleteLeague}>
                        <input type="hidden" name="id" value={league.id} />
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
