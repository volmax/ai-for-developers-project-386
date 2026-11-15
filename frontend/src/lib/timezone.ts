/**
 * Получить сегодня в часовом поясе Europe/Moscow.
 * Используется для синхронизации с бэкендом (BookingService).
 */
export function getMoscowToday(): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");

  const year = get("year");
  const month = get("month") - 1; // months are 0-indexed
  const day = get("day");

  return new Date(year, month, day);
}
