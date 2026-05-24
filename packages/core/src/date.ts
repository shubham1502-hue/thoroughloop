export function nowIsoString(): string {
  return new Date().toISOString();
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function tomorrowIsoDate(from: Date = new Date()): string {
  return toIsoDate(addDays(from, 1));
}

export function nextWeekIsoDate(from: Date = new Date()): string {
  return toIsoDate(addDays(from, 7));
}

export function formatDisplayDate(value: string): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
