// Brand dates are ISO (2026-09-06), set in the mono
export function formatProjectDate(date?: Date): string {
  return date ? date.toISOString().slice(0, 10) : '';
}
