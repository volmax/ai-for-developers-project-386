import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { BookingPage } from "@/components/pages/BookingPage";
import type { Booking } from "@/services/api";

const mockGetEventTypes = vi.fn();
const mockGetAvailableSlots = vi.fn();
const mockGetFreeSlotsCount = vi.fn();
const mockCreateBooking = vi.fn();

vi.mock("@/services/api", () => ({
  getEventTypes: (...args: unknown[]) => mockGetEventTypes(...args),
  getAvailableSlots: (...args: unknown[]) => mockGetAvailableSlots(...args),
  getFreeSlotsCount: (...args: unknown[]) => mockGetFreeSlotsCount(...args),
  createBooking: (...args: unknown[]) => mockCreateBooking(...args),
  getUpcomingBookings: () => Promise.resolve([]),
}));

// Freeze "today" to a fixed date so tests are deterministic.
// today = 2026-11-15 → tomorrow = 2026-11-16 (day 16)
const FIXED_MOSCOW_TODAY = new Date(2026, 10, 15); // Nov 15, 00:00 Moscow
const TOMORROW_DAY = 16;
const TOMORROW_DATE_STR = "2026-11-16";

vi.mock("@/lib/timezone", () => ({
  getMoscowToday: () => FIXED_MOSCOW_TODAY,
}));

function renderWithRouter(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/booking/:eventTypeId" element={<BookingPage />} />
        <Route path="/events" element={<div>Events Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function createMockBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 1,
    eventTypeId: "1",
    eventTypeName: "Встреча 15 минут",
    eventDurationMinutes: 15,
    slotStart: `${TOMORROW_DATE_STR}T09:00:00`,
    slotEnd: `${TOMORROW_DATE_STR}T09:15:00`,
    guestName: "Тест Гость",
    guestEmail: "test@example.com",
    createdAt: "2026-11-15T10:00:00",
    ...overrides,
  };
}

async function bookSuccessfully(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

  // Select a date in the calendar (tomorrow's day)
  await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));

  // Click on a slot
  await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
  await user.click(screen.getByText("09:00"));

  // Fill the form
  await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");

  // Submit booking
  await user.click(screen.getByRole("button", { name: /продолжить/i }));

  await waitFor(() => expect(mockCreateBooking).toHaveBeenCalled());
  await waitFor(() => expect(screen.getByText(/бронирование создано/i)).toBeInTheDocument());
}

describe("BookingPage — кнопка 'Забронировать ещё'", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetEventTypes.mockResolvedValue([
      {
        id: 1,
        name: "Встреча 15 минут",
        description: "Короткий тип события",
        durationMinutes: 15,
      },
    ]);

    mockGetAvailableSlots.mockResolvedValue([
      `${TOMORROW_DATE_STR}T09:00:00`,
      `${TOMORROW_DATE_STR}T09:15:00`,
    ]);

    mockGetFreeSlotsCount.mockResolvedValue(2);
  });

  it("отображает кнопку 'Забронировать ещё' после успешного бронирования", async () => {
    mockCreateBooking.mockResolvedValue(createMockBooking());

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await bookSuccessfully(user);

    // Verify the "Забронировать ещё" button is present
    await waitFor(() => {
      const bookAgainButton = screen.getByRole("link", { name: /забронировать ещё/i });
      expect(bookAgainButton).toBeInTheDocument();
      expect(bookAgainButton).toHaveAttribute("href", "/events");
    });
  });

  it("переходит на /events при нажатии кнопки 'Забронировать ещё'", async () => {
    mockCreateBooking.mockResolvedValue(createMockBooking({ guestEmail: null }));

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await bookSuccessfully(user);

    // Click the "Забронировать ещё" button
    await waitFor(() => {
      const bookAgainButton = screen.getByRole("link", { name: /забронировать ещё/i });
      expect(bookAgainButton).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /забронировать ещё/i }));

    await waitFor(() => expect(screen.getByText("Events Page")).toBeInTheDocument());
  });
});

describe("BookingPage — базовый рендеринг", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetEventTypes.mockResolvedValue([
      {
        id: 1,
        name: "Встреча 15 минут",
        description: "Короткий тип события",
        durationMinutes: 15,
      },
    ]);

    mockGetAvailableSlots.mockResolvedValue([`${TOMORROW_DATE_STR}T09:00:00`]);
    mockGetFreeSlotsCount.mockResolvedValue(1);
  });

  it("отображает 'Загрузка...' при загрузке", () => {
    mockGetEventTypes.mockReturnValue(new Promise(() => {}));

    renderWithRouter("/booking/1");
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it("отображает информацию о событии после загрузки", async () => {
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    // Use heading level to uniquely identify event name
    expect(screen.getByRole("heading", { name: "Встреча 15 минут", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("15 мин")).toBeInTheDocument();
    expect(screen.getByText("Короткий тип события")).toBeInTheDocument();
    expect(screen.getByText("Host")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Календарь" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Статус слотов" })).toBeInTheDocument();
  });

  it("отображает 'Тип события не найден' при отсутствии события", async () => {
    mockGetEventTypes.mockResolvedValue([]);

    renderWithRouter("/booking/999");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    expect(screen.getByText("Тип события не найден")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /к каталогу событий/i })).toHaveAttribute(
      "href",
      "/events",
    );
  });

  it("отображает 'Выберите дату', когда дата не выбрана", async () => {
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    expect(screen.getByText("Выберите дату")).toBeInTheDocument();
  });
});

describe("BookingPage — выбор даты и слота", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetEventTypes.mockResolvedValue([
      {
        id: 1,
        name: "Встреча 15 минут",
        description: "Короткий тип события",
        durationMinutes: 15,
      },
    ]);

    mockGetAvailableSlots.mockResolvedValue([
      `${TOMORROW_DATE_STR}T09:00:00`,
      `${TOMORROW_DATE_STR}T09:15:00`,
      `${TOMORROW_DATE_STR}T10:00:00`,
    ]);
    mockGetFreeSlotsCount.mockResolvedValue(3);
  });

  it("отображает слоты при выборе даты", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    // Click on tomorrow's day
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));

    // Verify slots appear
    await waitFor(() => {
      expect(screen.getByText("09:00")).toBeInTheDocument();
      expect(screen.getByText("09:15")).toBeInTheDocument();
      expect(screen.getByText("10:00")).toBeInTheDocument();
    });

    // Verify each slot has "Свободно" status
    const allSlots = screen.getAllByText("Свободно");
    expect(allSlots.length).toBe(3);
  });

  it("отображает 'Нет свободных слотов', когда слотов нет", async () => {
    mockGetAvailableSlots.mockResolvedValue([]);

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));

    await waitFor(() => {
      expect(screen.getByText("Нет свободных слотов")).toBeInTheDocument();
    });
  });

  it("отображает выбранную дату в блоке 'Выбранная дата'", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Выбранная дата" })).toBeInTheDocument();
    });
  });

  it("отображает 'Время не выбрано', когда дата выбрана но слот нет", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));

    await waitFor(() => {
      expect(screen.getByText("Время не выбрано")).toBeInTheDocument();
    });
  });

  it("отображает выбранное время после выбора слота", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));

    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Выбранное время" })).toBeInTheDocument();
    });
  });

  it("подсвечивает выбранный слот", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));

    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());

    const slotButton = screen.getByText("09:00").closest("button");
    await user.click(slotButton!);

    // Check that the slot has accent styles (bg-accent class)
    await waitFor(() => {
      expect(slotButton).toHaveClass("bg-accent");
    });
  });
});

describe("BookingPage — форма бронирования", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetEventTypes.mockResolvedValue([
      {
        id: 1,
        name: "Встреча 15 минут",
        description: "Короткий тип события",
        durationMinutes: 15,
      },
    ]);

    mockGetAvailableSlots.mockResolvedValue([`${TOMORROW_DATE_STR}T09:00:00`]);
    mockGetFreeSlotsCount.mockResolvedValue(1);
  });

  it("отображает форму бронирования после выбора слота", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Бронирование" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ваше имя")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("email@example.com")).toBeInTheDocument();
    });
  });

  it("отображает кнопку 'Назад'", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await waitFor(() => {
      const backButton = screen.getByRole("button", { name: /назад/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton.closest("a")).toHaveAttribute("href", "/events");
    });
  });

  it("кнопка 'Продолжить' disabled без имени", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await waitFor(() => {
      const continueButton = screen.getByRole("button", { name: /продолжить/i });
      expect(continueButton).toBeDisabled();
    });
  });

  it("кнопка 'Продолжить' enabled когда заполнено имя", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест");

    await waitFor(() => {
      const continueButton = screen.getByRole("button", { name: /продолжить/i });
      expect(continueButton).toBeEnabled();
    });
  });
});

describe("BookingPage — создание бронирования", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetEventTypes.mockResolvedValue([
      {
        id: 1,
        name: "Встреча 15 минут",
        description: "Короткий тип события",
        durationMinutes: 15,
      },
    ]);

    mockGetAvailableSlots.mockResolvedValue([`${TOMORROW_DATE_STR}T09:00:00`]);
    mockGetFreeSlotsCount.mockResolvedValue(1);
  });

  it("создаёт бронирование при нажатии 'Продолжить'", async () => {
    mockCreateBooking.mockResolvedValue(createMockBooking());

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");

    await user.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => expect(mockCreateBooking).toHaveBeenCalled());

    const expectedCall = {
      eventTypeId: "1",
      slotStart: `${TOMORROW_DATE_STR}T09:00:00`,
      guestName: "Тест Гость",
      guestEmail: "test@example.com",
    };
    expect(mockCreateBooking).toHaveBeenCalledWith(expectedCall);
  });

  it("отображает подтверждение после успешного бронирования", async () => {
    mockCreateBooking.mockResolvedValue(
      createMockBooking({
        guestName: "Тест Гость",
        guestEmail: "test@example.com",
      }),
    );

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => {
      expect(screen.getByText(/бронирование создано/i)).toBeInTheDocument();
      // Check guest name in confirmation using custom matcher since text may be split
      expect(screen.getByText(/тест гость/i)).toBeInTheDocument();
      expect(screen.getByText(/email: test@example\.com/i)).toBeInTheDocument();
    });
  });

  it("отображает 'Создание...' при отправке формы", async () => {
    mockCreateBooking.mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve(createMockBooking()), 1000)),
    );

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => {
      expect(screen.getByText("Создание...")).toBeInTheDocument();
    });
  });

  it("отображает ошибку при конфликте (409)", async () => {
    const conflictError = new Error("Слот занят") as unknown as { status: number; message: string };
    conflictError.status = 409;
    mockCreateBooking.mockRejectedValue(conflictError);

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => {
      expect(screen.getByText("Ошибка")).toBeInTheDocument();
      expect(screen.getByText("Слот занят")).toBeInTheDocument();
    });
  });

  it("отображает общую ошибку при другой ошибке", async () => {
    const genericError = new Error("Неизвестная ошибка") as unknown as {
      status: number;
      message: string;
    };
    genericError.status = 500;
    mockCreateBooking.mockRejectedValue(genericError);

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => {
      expect(screen.getByText("Ошибка")).toBeInTheDocument();
      expect(screen.getByText("Неизвестная ошибка")).toBeInTheDocument();
    });
  });

  it("не показывает форму бронирования, когда слот не выбран", async () => {
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    // Should not show booking form header
    expect(screen.queryByRole("heading", { name: "Бронирование" })).not.toBeInTheDocument();
  });

  it("отображает ошибку и сохраняет форму при невалидном email", async () => {
    const validationError = new Error("Неверный формат email") as unknown as {
      status: number;
      message: string;
    };
    validationError.status = 400;
    mockCreateBooking.mockRejectedValue(validationError);

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.type(screen.getByPlaceholderText("email@example.com"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => {
      expect(screen.getByText("Ошибка")).toBeInTheDocument();
      expect(screen.getByText("Неверный формат email")).toBeInTheDocument();
      // Форма должна оставаться видимой
      expect(screen.getByPlaceholderText("Ваше имя")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("email@example.com")).toBeInTheDocument();
    });
  });

  it("отображает бронирование без email, если email пустой", async () => {
    mockCreateBooking.mockResolvedValue(
      createMockBooking({
        guestName: "Тест Гость",
        guestEmail: null,
      }),
    );

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => {
      expect(screen.getByText(/бронирование создано/i)).toBeInTheDocument();
      expect(screen.getByText(/тест гость/i)).toBeInTheDocument();
      expect(screen.queryByText("Email:")).not.toBeInTheDocument();
    });
  });
});
