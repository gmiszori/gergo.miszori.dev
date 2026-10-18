const projectDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatProjectDate(date?: Date): string {
  return date ? projectDateFormatter.format(date) : '';
}
