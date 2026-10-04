// One colour per production weekday, so a batch's day is visible at a glance
// on labels, lists and the mobile app. Indexed by JavaScript's getUTCDay().
export const BATCH_DAY_COLORS = [
  { day: 'Sunday', color: 'Pink', hex: '#ec4899' },
  { day: 'Monday', color: 'Yellow', hex: '#facc15' },
  { day: 'Tuesday', color: 'Blue', hex: '#3b82f6' },
  { day: 'Wednesday', color: 'Red', hex: '#ef4444' },
  { day: 'Thursday', color: 'Green', hex: '#22c55e' },
  { day: 'Friday', color: 'Orange', hex: '#f97316' },
  { day: 'Saturday', color: 'Purple', hex: '#a855f7' },
] as const;

export function dayColorFor(isoDate: string) {
  return BATCH_DAY_COLORS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
}
