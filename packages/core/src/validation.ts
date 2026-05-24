export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function hasUsefulContext(value: string): boolean {
  return normalizeText(value).length > 0;
}

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}
