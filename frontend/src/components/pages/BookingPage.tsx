import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getEventTypes,
  getAvailableSlots,
  getFreeSlotsCount,
  createBooking,
  type EventType,
  type Booking,
  type BookingRequest,
} from "@/services/api";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

function formatDateRu(date: Date): string {
  const days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

function formatTimeSlot(isoString: string): string {
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [freeSlotsByDate, setFreeSlotsByDate] = useState<Record<string, number>>({});

  // Slot status state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Booking form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Calculate booking window: tomorrow (inclusive) to tomorrow + 13 days (inclusive) = 14 calendar days
  const tomorrow = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = new Date(today);
    result.setDate(result.getDate() + 1);
    return result;
  }, []);

  const bookingWindowEnd = useMemo(() => {
    const end = new Date(tomorrow);
    end.setDate(end.getDate() + 13);
    return end;
  }, [tomorrow]);

  // Fetch event types
  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const data = await getEventTypes();
        if (!cancelled) {
          const found = data.find((e) => String(e.id) === eventTypeId);
          setEventType(found || null);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [eventTypeId]);

  // Fetch free slots count for visible calendar months
  const fetchFreeSlotsForDates = useCallback(async () => {
    if (!eventType) return;
    const results: Record<string, number> = {};

    // Fetch for current month and next month
    for (let m = 0; m <= 1; m++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + m, 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

      for (let d = 1; d <= lastDay; d++) {
        const dayDate = new Date(date.getFullYear(), date.getMonth(), d);
        const windowEnd = new Date(bookingWindowEnd);
        windowEnd.setHours(0, 0, 0, 0);

        if (dayDate >= tomorrow && dayDate <= windowEnd) {
          const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`;
          try {
            const count = await getFreeSlotsCount(eventType.id, dateStr);
            results[dateStr] = count;
          } catch {
            results[dateStr] = 0;
          }
        }
      }
    }

    setFreeSlotsByDate(results);
  }, [eventType, currentDate, tomorrow, bookingWindowEnd]);

  useEffect(() => {
    fetchFreeSlotsForDates();
  }, [fetchFreeSlotsForDates]);

  // Fetch available slots for selected date
  useEffect(() => {
    if (!eventType || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    let cancelled = false;
    async function fetch() {
      try {
        const slots = await getAvailableSlots(eventType!.id, dateStr);
        if (!cancelled) {
          setAvailableSlots(slots);
          setSelectedSlot(null);
        }
      } catch {
        if (!cancelled) {
          setAvailableSlots([]);
        }
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [eventType, selectedDate]);

  // Handle booking submission
  const handleContinue = async () => {
    if (!selectedSlot || !guestName.trim()) return;

    setIsSubmitting(true);
    setBookingError(null);
    setBookingResult(null);

    try {
      const request: BookingRequest = {
        eventTypeId: eventType!.id,
        slotStart: selectedSlot,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || undefined,
      };

      const booking = await createBooking(request);
      setBookingResult(booking);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error.status === 409) {
        setBookingError(error.message || "Этот слот уже занят");
      } else {
        setBookingError(error.message || "Ошибка при создании бронирования");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium text-destructive">Тип события не найден</p>
          <Link to="/events">
            <Button variant="outline">К каталогу событий</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        {/* Column 1: Event Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
              {eventType.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{eventType.name}</p>
              <p className="text-sm text-muted-foreground">Host</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{eventType.name}</CardTitle>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  {eventType.durationMinutes} мин
                </span>
              </div>
              <CardDescription>{eventType.description}</CardDescription>
            </CardHeader>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Выбранная дата</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{formatDateRu(selectedDate)}</p>
              </CardContent>
            </Card>
          )}

          {selectedSlot && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Выбранное время</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{formatTimeSlot(selectedSlot)}</p>
              </CardContent>
            </Card>
          )}

          {!selectedSlot && selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Выбранное время</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Время не выбрано</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Column 2: Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Календарь</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              selectedDate={selectedDate}
              freeSlotsByDate={freeSlotsByDate}
              bookingWindowEnd={bookingWindowEnd}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setCurrentDate(date);
              }}
            />
          </CardContent>
        </Card>

        {/* Column 3: Slot Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Статус слотов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedDate ? (
                availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        selectedSlot === slot
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <span>{formatTimeSlot(slot)}</span>
                      <span className="text-xs">Свободно</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Нет свободных слотов</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Выберите дату</p>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          {selectedSlot && (
            <Card>
              <CardHeader>
                <CardTitle>Бронирование</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingResult ? (
                  <div className="space-y-2">
                    <p className="font-medium text-green-600">Бронирование создано!</p>
                    <p className="text-sm text-muted-foreground">
                      {eventType.name} — {formatTimeSlot(bookingResult.slotStart)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Гость: {bookingResult.guestName}
                    </p>
                    {bookingResult.guestEmail && (
                      <p className="text-sm text-muted-foreground">
                        Email: {bookingResult.guestEmail}
                      </p>
                    )}
                    <Link to="/events">
                      <Button variant="outline" className="mt-2 w-full">
                        Забронировать ещё
                      </Button>
                    </Link>
                  </div>
                ) : bookingError ? (
                  <div className="space-y-2">
                    <p className="font-medium text-destructive">Ошибка</p>
                    <p className="text-sm text-muted-foreground">{bookingError}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Имя *</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-2">
            <Link to="/events">
              <Button variant="outline" className="flex-1">
                Назад
              </Button>
            </Link>
            <Button
              onClick={handleContinue}
              disabled={!selectedSlot || !guestName.trim() || isSubmitting || !!bookingResult}
              className="flex-1"
            >
              {isSubmitting ? "Создание..." : "Продолжить"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
