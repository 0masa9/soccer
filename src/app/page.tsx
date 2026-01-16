import Link from "next/link";

export default function Home() {
  const sections = [
    {
      href: "/teams",
      title: "チーム管理",
      description: "国・ホームスタジアム情報を整理して基盤データを整える。",
      meta: "Team",
    },
    {
      href: "/leagues",
      title: "リーグ運用",
      description: "勝ち点ルールと試合結果で順位表を自動更新。",
      meta: "League",
    },
    {
      href: "/tournaments",
      title: "トーナメント",
      description: "single elimination の勝ち上がりを管理。",
      meta: "Tournament",
    },
  ];

  const revealClasses = ["reveal-2", "reveal-3", "reveal-4"];

  return (
    <section className="space-y-12">
      <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6 reveal">
          <span className="badge">FOLD MVP</span>
          <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
            サッカーの順位表を主役に
            <br />
            <span className="text-[var(--accent)]">リーグと大会を編み上げる</span>
          </h1>
          <p className="max-w-xl text-base text-[var(--muted)]">
            順位表づくりを中心に、チーム・リーグ・試合・トーナメントを最小構成で回すための
            ベースプロジェクトです。
          </p>
          <div className="flow">
            <span className="flow-step">チーム</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">リーグ</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">試合結果</span>
            <span className="flow-arrow">→</span>
            <span className="flow-step">順位表</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="tag">Next.js</span>
            <span className="tag">Supabase</span>
            <span className="tag">Tailwind</span>
          </div>
        </div>

        <div className="surface surface-strong reveal reveal-1">
          <div className="space-y-4">
            <p className="section-eyebrow">MVP Status</p>
            <h2 className="section-title">最短ルートの実装順</h2>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>チーム/リーグ/試合のCRUDを整備</li>
              <li>勝ち点ルールと順位表の計算を共通化</li>
              <li>トーナメントはsingle eliminationで初期運用</li>
            </ul>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-subtle">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-2)]">
                  Spec Doc
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  `docs/spec.html` にまとめ済み。
                </p>
              </div>
              <div className="surface-subtle">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-2)]">
                  Supabase
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  `supabase/schema.sql` で初期化。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((section, index) => (
          <Link
            key={section.href}
            href={section.href}
            className={`card-link reveal ${revealClasses[index]}`}
          >
            <span className="card-link__meta">{section.meta}</span>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="text-sm text-[var(--muted)]">
              {section.description}
            </p>
            <span className="mt-4 text-xs font-semibold text-[var(--accent-2)]">
              進む →
            </span>
          </Link>
        ))}
      </div>

      <div className="surface reveal reveal-4">
        <h2 className="text-lg font-semibold">設計ドック</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          仕様まとめは{" "}
          <code className="rounded bg-black/5 px-2 py-1 text-xs">
            docs/spec.html
          </code>{" "}
          に保存済みです。
        </p>
      </div>
    </section>
  );
}
