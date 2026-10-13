export function formatMatchTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatMatchDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function statusLabel(status: string): string {
  switch (status) {
    case "LIVE":
      return "Live";
    case "COMPLETED":
      return "Final";
    default:
      return "Scheduled";
  }
}
