const TIME_PATTERN = /(?:T|\s)?(\d{2}):(\d{2})(?::\d{2})?/;

export function formatPlainTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const match = value.match(TIME_PATTERN);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatPlainTimeRange(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  fallback = "Time not set",
) {
  const startTime = formatPlainTime(startsAt);
  const endTime = formatPlainTime(endsAt);

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime ?? endTime ?? fallback;
}
