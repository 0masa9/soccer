"use client";

type FormErrorProps = {
  message?: string | null;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-lg border border-[rgba(240,93,59,0.4)] bg-[rgba(240,93,59,0.12)] px-3 py-2 text-xs text-[var(--accent)]">
      {message}
    </p>
  );
}
