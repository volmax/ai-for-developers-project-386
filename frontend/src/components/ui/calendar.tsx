import { useMemo } from "react";
import { getMoscowToday } from "@/lib/timezone";

interface CalendarProps {
  year: number;
  month: number;
  selectedDate: Date | null;
  freeSlotsByDate: Record<string, number>;
  bookingWindowEnd: Date;
  onSelectDate: (date: Date) => void;
}

const DAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS_RU = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

export function Calendar({
  year,
  month,
  selectedDate,
  freeSlotsByDate,
  bookingWindowEnd,
  onSelectDate,
}: CalendarProps) {
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay();
    // Convert Sunday=0 to Monday-based: Mon=0, Tue=1, ..., Sun=6
    startDay = startDay === 0 ? 6 : startDay - 1;

    const days: { date: Date | null; day: number }[] = [];

    // Padding days from previous month
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, day: 0 });
    }

    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), day: d });
    }

    return days;
  }, [year, month]);

  const isOutOfWindow = (date: Date) => {
    const today = getMoscowToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const windowEnd = new Date(bookingWindowEnd);
    windowEnd.setHours(0, 0, 0, 0);
    // Skip weekends (Saturday=6, Sunday=0 in JS)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    return date < tomorrow || date > windowEnd;
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => onSelectDate(new Date(year, month - 1, 1))}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Предыдущий месяц"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold">
          {MONTHS_RU[month]} {year} г.
        </h3>
        <button
          onClick={() => onSelectDate(new Date(year, month + 1, 1))}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Следующий месяц"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS_RU.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {calendarDays.map((item, index) => {
          if (item.date === null) {
            return <div key={`empty-${index}`} className="min-h-[60px]" />;
          }

          const outOfWindow = isOutOfWindow(item.date);
          const isSelected =
            selectedDate !== null &&
            item.date.getFullYear() === selectedDate.getFullYear() &&
            item.date.getMonth() === selectedDate.getMonth() &&
            item.date.getDate() === selectedDate.getDate();

          const dateKey = formatDateKey(item.date);
          const freeSlots = freeSlotsByDate[dateKey] ?? 0;

          return (
            <button
              key={index}
              disabled={outOfWindow}
              onClick={() => onSelectDate(item.date!)}
              className={`
                relative min-h-[60px] rounded-lg p-2 text-left transition-colors
                ${
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : outOfWindow
                      ? "cursor-not-allowed text-muted-foreground/50"
                      : "hover:bg-accent/50"
                }
              `}
            >
              <span className="text-sm font-medium">{item.day}</span>
              {!outOfWindow && (
                <div className="mt-1 text-xs text-muted-foreground">{freeSlots} св.</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
