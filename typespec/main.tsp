import "@typespec/http";

using Http;

/**
 * API для управления бронированиями календаря
 */
@service(#{ title: "Booking API" })
namespace Calendar;

/**
 * Тип события (захардкожен)
 */
model EventType {
  /** Уникальный идентификатор */
  id: string;

  /** Название типа события */
  name: string;

  /** Описание типа события */
  description: string;

  /** Длительность в минутах (15 или 30) */
  durationMinutes: 15 | 30;
}

/**
 * Бронирование слота
 */
model Booking {
  /** Уникальный идентификатор */
  id: string;

  /** ID типа события */
  eventTypeId: string;

  /** Название типа события (денормализовано) */
  eventTypeName: string;

  /** Длительность события в минутах (денормализовано) */
  eventDurationMinutes: int32;

  /** Время начала бронирования */
  slotStart: utcDateTime;

  /** Время окончания бронирования */
  slotEnd: utcDateTime;

  /** Имя гостя (обязательно) */
  guestName: string;

  /** Email гостя (опционально) */
  guestEmail?: string;

  /** Дата создания */
  createdAt: utcDateTime;
}

/**
 * Запрос на создание бронирования
 */
model BookingRequest {
  /** ID типа события */
  eventTypeId: string;

  /** Время начала слота (ISO 8601) */
  slotStart: utcDateTime;

  /** Имя гостя (обязательно) */
  guestName: string;

  /** Email гостя (опционально) */
  guestEmail?: string;
}

/**
 * Ответ 201 — бронирование создано
 */
model BookingCreated {
  /** Созданное бронирование */
  @statusCode status: 201;
  booking: Booking;
}

/**
 * Ответ 409 — конфликт бронирования
 */
model BookingConflict {
  /** Код ошибки */
  @statusCode status: 409;
  code: string;

  /** Описание ошибки */
  message: string;
}

/**
 * Ошибка
 */
@error
model ErrorResponse {
  /** Код ошибки */
  code: string;

  /** Описание ошибки */
  message: string;
}

/**
 * Ответ с количеством свободных слотов
 */
model FreeSlotsCountResult {
  /** Количество свободных слотов на дату */
  count: int32;
}

/**
 * Операции с типами событий
 */
@route("/api/event-types")
@tag("EventTypes")
interface EventTypes {
  /** Получить список типов событий */
  @get list(): EventType[] | ErrorResponse;
}

/**
 * Операции с бронированиями
 */
@route("/api/bookings")
@tag("Bookings")
interface Bookings {
  /** Создать бронирование (201/409) */
  @post create(@body body: BookingRequest): BookingCreated | BookingConflict;

  /** Получить предстоящие встречи */
  @get upcoming(): Booking[] | ErrorResponse;

  /** Получить доступные слоты */
  @get
  @route("available-slots")
  availableSlots(
    @query() eventTypeId: string,
    @query() date: string
  ): string[] | ErrorResponse;

  /** Получить количество свободных слотов */
  @get
  @route("free-slots-count")
  freeSlotsCount(
    @query() eventTypeId: string,
    @query() date: string
  ): FreeSlotsCountResult | ErrorResponse;
}
