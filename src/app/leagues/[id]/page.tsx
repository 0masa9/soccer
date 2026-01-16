import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parsePointRule } from "@/lib/league/point-rule";
import { calculateStandings } from "@/lib/league/standings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { League, Match, Team } from "@/lib/types";
import { removeLeagueTeam, deleteLeagueMatch } from "./actions";
import { AddTeamForm, MatchCreateForm, MatchResultForm } from "./league-forms";

type LeagueDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function LeagueDetailPage({
  params,
}: LeagueDetailPageProps) {
  const supabase = await createSupabaseServerClient();
  const leagueId = params.id;

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", leagueId)
    .single();

  if (leagueError || !league) {
    return (
      <section className="space-y-6 reveal">
        <h1 className="section-title">リーグ詳細</h1>
        <p className="text-sm text-[var(--accent)]">
          リーグを取得できませんでした: {leagueError?.message}
        </p>
        <Link href="/leagues">
          <Button variant="outline">一覧へ戻る</Button>
        </Link>
      </section>
    );
  }

  const { data: allTeams } = await supabase
    .from("teams")
    .select("*")
    .order("name");

  const { data: leagueTeamRows } = await supabase
    .from("league_teams")
    .select("team_id")
    .eq("league_id", leagueId);

  const leagueTeamIds = new Set(
    (leagueTeamRows ?? []).map((row) => row.team_id),
  );

  const teamsInLeague = leagueTeamIds.size
    ? ((
        await supabase
          .from("teams")
          .select("*")
          .in("id", Array.from(leagueTeamIds))
          .order("name")
      ).data ?? []) as Team[]
    : [];
  const availableTeams = (allTeams ?? []).filter(
    (team) => !leagueTeamIds.has(team.id),
  ) as Team[];

  const { data: matchesData } = await supabase
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(id,name), away_team:teams!matches_away_team_id_fkey(id,name)",
    )
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false });

  const matches = (matchesData ?? []) as Array<
    Match & { home_team: Team; away_team: Team }
  >;

  const pointRule = parsePointRule((league as League).point_rule);
  const standings = calculateStandings(teamsInLeague, matches, pointRule);

  return (
    <section className="space-y-8 reveal">
      <header className="space-y-2">
        <p className="section-eyebrow">League Detail</p>
        <h1 className="section-title">{league.name}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <span>{league.season_label}</span>
          <span className="text-xs">/</span>
          <span>{league.country ?? "国未設定"}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="surface space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">参加チーム</h2>
            <Badge variant="accent">{teamsInLeague.length} Teams</Badge>
          </div>
          {teamsInLeague.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              まだ参加チームがありません。
            </p>
          ) : (
            <div className="grid gap-2">
              {teamsInLeague.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {team.country} / {team.stadium_name}
                    </p>
                  </div>
                  <form action={removeLeagueTeam}>
                    <input type="hidden" name="league_id" value={leagueId} />
                    <input type="hidden" name="team_id" value={team.id} />
                    <Button size="sm" variant="ghost">
                      削除
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface space-y-4">
          <h2 className="text-base font-semibold">チーム追加</h2>
          {availableTeams.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              追加できるチームがありません。先にチームを作成してください。
            </p>
          ) : (
            <AddTeamForm
              leagueId={leagueId}
              options={availableTeams.map((team) => ({
                id: team.id,
                name: team.name,
              }))}
            />
          )}
        </div>
      </div>

      <div className="surface space-y-4">
        <h2 className="text-base font-semibold">試合追加</h2>
        {teamsInLeague.length < 2 ? (
          <p className="text-sm text-[var(--muted)]">
            2チーム以上参加すると試合を追加できます。
          </p>
        ) : (
          <MatchCreateForm
            leagueId={leagueId}
            teams={teamsInLeague.map((team) => ({ id: team.id, name: team.name }))}
          />
        )}
      </div>

      <div className="surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">試合一覧</h2>
          <Badge>{matches.length} Matches</Badge>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            まだ試合がありません。上のフォームから追加してください。
          </p>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {match.home_team?.name ?? "TBD"} vs{" "}
                      {match.away_team?.name ?? "TBD"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {match.kickoff_date ?? "日付未設定"} / {match.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    {match.status === "played" ? (
                      <span>
                        {match.score_home ?? 0} - {match.score_away ?? 0}
                      </span>
                    ) : (
                      <span>未開催</span>
                    )}
                    {match.went_to_pk && (
                      <span>
                        PK {match.pk_home ?? 0} - {match.pk_away ?? 0}
                      </span>
                    )}
                  </div>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-2)]">
                    結果を編集
                  </summary>
                  <div className="mt-3">
                    <MatchResultForm match={match} />
                    <form action={deleteLeagueMatch} className="mt-3">
                      <input type="hidden" name="match_id" value={match.id} />
                      <Button variant="ghost" size="sm">
                        試合を削除
                      </Button>
                    </form>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">順位表</h2>
          <Badge variant="accent">Auto Calculated</Badge>
        </div>
        {standings.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            まだ順位がありません。試合結果を入力してください。
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>順位</TableHead>
                <TableHead>チーム</TableHead>
                <TableHead>試合</TableHead>
                <TableHead>勝</TableHead>
                <TableHead>分</TableHead>
                <TableHead>負</TableHead>
                <TableHead>得点</TableHead>
                <TableHead>失点</TableHead>
                <TableHead>得失点</TableHead>
                <TableHead>勝ち点</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((row, index) => (
                <TableRow key={row.team_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-semibold">
                    {row.team_name}
                  </TableCell>
                  <TableCell>{row.played}</TableCell>
                  <TableCell>{row.wins}</TableCell>
                  <TableCell>{row.draws}</TableCell>
                  <TableCell>{row.losses}</TableCell>
                  <TableCell>{row.goals_for}</TableCell>
                  <TableCell>{row.goals_against}</TableCell>
                  <TableCell>{row.goal_diff}</TableCell>
                  <TableCell>{row.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
