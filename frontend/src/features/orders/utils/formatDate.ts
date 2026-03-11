/**
 * Formats ISO timestamps into locale-friendly date/time labels.
 */
// Formats an ISO timestamp into a human-friendly date/time string.
export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
