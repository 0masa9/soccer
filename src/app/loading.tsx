export default function Loading() {
  return (
    <section className="space-y-6 reveal">
      <div className="surface space-y-3 animate-pulse">
        <div className="h-4 w-28 rounded-full bg-[var(--border)]" />
        <div className="h-8 w-64 rounded-full bg-[var(--border)]" />
        <div className="h-4 w-80 rounded-full bg-[var(--border)]" />
      </div>
      <div className="surface space-y-3 animate-pulse">
        <div className="h-4 w-32 rounded-full bg-[var(--border)]" />
        <div className="h-20 w-full rounded-2xl bg-[var(--card)]" />
      </div>
    </section>
  );
}
