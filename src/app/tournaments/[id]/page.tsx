import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMatchWinnerId } from "@/lib/tournament/bracket";
import type { Match, Team, Tournament, TournamentRound } from "@/lib/types";
import { removeTournamentEntry } from "./actions";
import {
  TournamentEntryForm,
  TournamentMatchResultForm,
  TournamentRoundForm,
} from "./tournament-forms";

type TournamentDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function TournamentDetailPage({
  params,
}: TournamentDetailPageProps) {
  const supabase = await createSupabaseServerClient();
  const tournamentId = params.id;

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return (
      <section className="space-y-6 reveal">
        <h1 className="section-title">トーナメント詳細</h1>
        <p className="text-sm text-[var(--accent)]">
          トーナメントを取得できませんでした: {tournamentError?.message}
        </p>
        <Link href="/tournaments">
          <Button variant="outline">一覧へ戻る</Button>
        </Link>
      </section>
    );
  }

  const { data: allTeams } = await supabase
    .from("teams")
    .select("*")
    .order("name");

  const { data: entryData } = await supabase
    .from("tournament_entries")
    .select("team_id, teams ( id, name, country )")
    .eq("tournament_id", tournamentId);

  const entryTeams = (entryData ?? [])
    .map((row) => (row as { teams: Team | null }).teams)
    .filter((team): team is Team => Boolean(team));

  const entryTeamIds = new Set(entryTeams.map((team) => team.id));
  const availableTeams = (allTeams ?? []).filter(
    (team) => !entryTeamIds.has(team.id),
  ) as Team[];

  const { data: roundsData } = await supabase
    .from("tournament_rounds")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("round_no");

  const rounds = (roundsData ?? []) as TournamentRound[];

  const roundIds = rounds.map((round) => round.id);
  const { data: roundMatchData } =
    roundIds.length > 0
      ? await supabase
          .from("tournament_round_matches")
          .select("round_id, match_id")
          .in("round_id", roundIds)
      : { data: [] };

  const { data: matchesData } = await supabase
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(id,name), away_team:teams!matches_away_team_id_fkey(id,name)",
    )
    .eq("tournament_id", tournamentId)
    .order("created_at");

  const matches = (matchesData ?? []) as Array<
    Match & { home_team: Team; away_team: Team }
  >;

  const matchesById = new Map(matches.map((match) => [match.id, match]));
  const teamNameById = new Map((allTeams ?? []).map((team) => [team.id, team.name]));

  const roundMatches = new Map<string, Array<Match & { home_team: Team; away_team: Team }>>();
  (roundMatchData ?? []).forEach((row) => {
    const match = matchesById.get(row.match_id);
    if (!match) {
      return;
    }
    const list = roundMatches.get(row.round_id) ?? [];
    list.push(match);
    roundMatches.set(row.round_id, list);
  });

  return (
    <section className="space-y-8 reveal">
      <header className="space-y-2">
        <p className="section-eyebrow">Tournament Detail</p>
        <h1 className="section-title">{(tournament as Tournament).name}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <span>{tournament.season_label}</span>
          <span className="text-xs">/</span>
          <span>{tournament.format}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="surface space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">参加チーム</h2>
            <Badge variant="accent">{entryTeams.length} Teams</Badge>
          </div>
          {entryTeams.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              まだ参加チームがありません。
            </p>
          ) : (
            <div className="grid gap-2">
              {entryTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {team.country}
                    </p>
                  </div>
                  <form action={removeTournamentEntry}>
                    <input type="hidden" name="tournament_id" value={tournamentId} />
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
            <TournamentEntryForm
              tournamentId={tournamentId}
              options={availableTeams.map((team) => ({
                id: team.id,
                name: team.name,
              }))}
            />
          )}
        </div>
      </div>

      <div className="surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">対戦カード生成</h2>
          <Badge>Round {rounds.length + 1}</Badge>
        </div>
        <p className="text-sm text-[var(--muted)]">
          参加チームを揃えたら「次のラウンド」を生成してください。
        </p>
        <TournamentRoundForm tournamentId={tournamentId} />
      </div>

      <div className="surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">ブラケット</h2>
          <Badge variant="accent">Single Elim</Badge>
        </div>
        {rounds.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            まだラウンドがありません。対戦カードを生成してください。
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {rounds.map((round) => {
              const roundMatchList = roundMatches.get(round.id) ?? [];
              const byeTeams = round.bye_team_ids ?? [];
              return (
                <div key={round.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Round {round.round_no}</h3>
                    <span className="text-xs text-[var(--muted)]">
                      {roundMatchList.length} matches
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    {roundMatchList.length === 0 ? (
                      <p className="text-xs text-[var(--muted)]">対戦カードなし</p>
                    ) : (
                      roundMatchList.map((match) => {
                        const winnerId = getMatchWinnerId(match);
                        return (
                          <div key={match.id} className="flex items-center justify-between">
                            <span>
                              {match.home_team?.name ?? "TBD"} vs{" "}
                              {match.away_team?.name ?? "TBD"}
                            </span>
                            <span className="text-xs text-[var(--muted)]">
                              {winnerId ? `Winner: ${teamNameById.get(winnerId) ?? "TBD"}` : "-"}
                            </span>
                          </div>
                        );
                      })
                    )}
                    {byeTeams.length > 0 && (
                      <div className="text-xs text-[var(--muted)]">
                        Bye:{" "}
                        {byeTeams
                          .map((teamId) => teamNameById.get(teamId) ?? "TBD")
                          .join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">試合結果入力</h2>
          <Badge>{matches.length} Matches</Badge>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            まだ試合がありません。ラウンド生成後に表示されます。
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
                      {match.status} / {match.kickoff_date ?? "日付未設定"}
                    </p>
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {match.status === "played" ? (
                      <span>
                        {match.score_home ?? 0} - {match.score_away ?? 0}
                      </span>
                    ) : (
                      <span>未開催</span>
                    )}
                  </div>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-2)]">
                    結果を編集
                  </summary>
                  <div className="mt-3">
                    <TournamentMatchResultForm match={match} />
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
