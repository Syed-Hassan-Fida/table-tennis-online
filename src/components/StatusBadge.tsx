import { statusLabel } from "@/lib/format";

const SHORT: Record<string, string> = {
  SCHEDULED: "Upcoming",
  LIVE: "Live",
  COMPLETED: "Final",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toUpperCase();
  const label = SHORT[key] ?? statusLabel(status);

  return (
    <span className={`status-badge status-${key.toLowerCase()}`} data-status={key}>
      <span className="status-badge-dot" aria-hidden />
      {label}
    </span>
  );
}
