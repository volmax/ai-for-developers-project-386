import "@typespec/http";

using Http;

/**
 * API для управления бронированиями
 */
@service(#{ title: "Booking API" })
namespace BookingApi;

/** Тип события */
enum EventType {
  /** Создание */
  Created: "created",

  /** Подтверждение */
  Confirmed: "confirmed",

  /** Отмена */
  Cancelled: "cancelled",

  /** Завершение */
  Completed: "completed",
}

/** Запрос на создание бронирования */
model BookingRequest {
  /** ID события */
  eventId: string;

  /** Имя пользователя */
  userName: string;

  /** Email пользователя */
  userEmail: string;

  /** Количество мест */
  seats: int32;
}

/** Бронирование */
model Booking {
  /** Уникальный идентификатор */
  id: string;

  /** ID события */
  eventId: string;

  /** Имя пользователя */
  userName: string;

  /** Email пользователя */
  userEmail: string;

  /** Количество мест */
  seats: int32;

  /** Статус бронирования */
  status: EventType;

  /** Дата создания */
  createdAt: utcDateTime;
}

/** Ошибка */
@error
model ErrorResponse {
  /** Код ошибки */
  code: string;

  /** Описание ошибки */
  message: string;
}

/** Результат с пагинацией */
model PagedResult {
  /** Список бронирований */
  items: Booking[];

  /** Общее количество */
  totalCount: int32;
}

/** Операции с бронированиями */
@route("/api/bookings")
@tag("Bookings")
interface Bookings {
  /** Получить список бронирований */
  @get list(
    @query() $skip?: int32,
    @query() $top?: int32
  ): PagedResult | ErrorResponse;

  /** Создать бронирование */
  @post create(@body body: BookingRequest): Booking | ErrorResponse;

  /** Получить бронирование по ID */
  @route("{id}")
  @get get(
    @path() id: string
  ): Booking | ErrorResponse;

  /** Обновить статус бронирования */
  @route("{id}")
  @patch updateStatus(
    @path() id: string,
    @body body: { status: EventType }
  ): Booking | ErrorResponse;

  /** Удалить бронирование */
  @route("{id}")
  @delete delete(
    @path() id: string
  ): void | ErrorResponse;
}
