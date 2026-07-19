export function relativeTime(timestamp: string | number | Date): string {
  const difference = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.max(0, Math.floor(difference / 1000));

  if (seconds < 60) return "just now";
  if (seconds < 3_600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86_400) {
    const hours = Math.floor(seconds / 3_600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(seconds / 86_400);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
