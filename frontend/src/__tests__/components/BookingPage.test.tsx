import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { BookingPage } from "@/components/pages/BookingPage";
import type { Booking } from "@/services/api";

declare global {
  // eslint-disable-next-line no-var
  var mockFetch: ReturnType<typeof vi.fn>;
}

const mockFetch = globalThis.mockFetch as ReturnType<typeof vi.fn>;

const FIXED_MOSCOW_TODAY = new Date(2026, 10, 15);
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

const EVENT_TYPES = [
  {
    id: 1,
    name: "Встреча 15 минут",
    description: "Короткий тип события",
    durationMinutes: 15,
  },
];

// Custom POST handler for createBooking — set this in tests that need it
let customPostHandler: ((url: string, init?: RequestInit) => Promise<Response>) | null = null;
let customSlots: string[] = [];
let customFreeCount = 0;

function setupDefaultMocks(slots: string[], freeCount: number) {
  customSlots = slots;
  customFreeCount = freeCount;
  customPostHandler = null;
  mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
    if (url === "/api/event-types") {
      return new Response(JSON.stringify(EVENT_TYPES), { status: 200 });
    }
    if (url.includes("/api/bookings/free-slots-count")) {
      return new Response(JSON.stringify({ count: customFreeCount }), { status: 200 });
    }
    if (url.includes("/api/bookings/available-slots")) {
      return new Response(JSON.stringify(customSlots), { status: 200 });
    }
    if (url === "/api/bookings" && init?.method === "POST") {
      if (customPostHandler) {
        return customPostHandler(url, init);
      }
      return new Response(JSON.stringify({ booking: createMockBooking() }), { status: 201 });
    }
    return new Response(JSON.stringify({}), { status: 200 });
  });
}

function setPostHandler(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  customPostHandler = handler;
}

describe("BookingPage — кнопка 'Забронировать ещё'", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks([`${TOMORROW_DATE_STR}T09:00:00`, `${TOMORROW_DATE_STR}T09:15:00`], 2);
  });

  it("отображает кнопку 'Забронировать ещё' после успешного бронирования", async () => {
    setPostHandler(
      async () => new Response(JSON.stringify({ booking: createMockBooking() }), { status: 201 }),
    );

    const user = userEvent.setup();
    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));

    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => expect(screen.getByText(/бронирование создано/i)).toBeInTheDocument());

    await waitFor(() => {
      const bookAgainButton = screen.getByRole("link", { name: /забронировать ещё/i });
      expect(bookAgainButton).toBeInTheDocument();
      expect(bookAgainButton).toHaveAttribute("href", "/events");
    });
  });

  it("переходит на /events при нажатии кнопки 'Забронировать ещё'", async () => {
    setPostHandler(
      async () =>
        new Response(JSON.stringify({ booking: createMockBooking({ guestEmail: undefined }) }), {
          status: 201,
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

    await waitFor(() => expect(screen.getByText(/бронирование создано/i)).toBeInTheDocument());

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
    setupDefaultMocks([`${TOMORROW_DATE_STR}T09:00:00`], 1);
  });

  it("отображает 'Загрузка...' при загрузке", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderWithRouter("/booking/1");
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it("отображает информацию о событии после загрузки", async () => {
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Встреча 15 минут", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("15 мин")).toBeInTheDocument();
    expect(screen.getByText("Короткий тип события")).toBeInTheDocument();
    expect(screen.getByText("Host")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Календарь" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Статус слотов" })).toBeInTheDocument();
  });

  it("отображает 'Тип события не найден' при отсутствии события", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url === "/api/event-types") {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });
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
    setupDefaultMocks(
      [
        `${TOMORROW_DATE_STR}T09:00:00`,
        `${TOMORROW_DATE_STR}T09:15:00`,
        `${TOMORROW_DATE_STR}T10:00:00`,
      ],
      3,
    );
  });

  it("отображает слоты при выборе даты", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => {
      expect(screen.getByText("09:00")).toBeInTheDocument();
      expect(screen.getByText("09:15")).toBeInTheDocument();
      expect(screen.getByText("10:00")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Свободно").length).toBe(3);
  });

  it("отображает 'Нет свободных слотов', когда слотов нет", async () => {
    customSlots = [];
    customFreeCount = 0;
    const user = userEvent.setup();
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("Нет свободных слотов")).toBeInTheDocument());
  });

  it("отображает выбранную дату в блоке 'Выбранная дата'", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Выбранная дата" })).toBeInTheDocument(),
    );
  });

  it("отображает 'Время не выбрано', когда дата выбрана но слот нет", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("Время не выбрано")).toBeInTheDocument());
  });

  it("отображает выбранное время после выбора слота", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Выбранное время" })).toBeInTheDocument(),
    );
  });

  it("подсвечивает выбранный слот", async () => {
    const user = userEvent.setup();
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    const slotButton = screen.getByText("09:00").closest("button");
    await user.click(slotButton!);
    await waitFor(() => expect(slotButton).toHaveClass("bg-accent"));
  });
});

describe("BookingPage — форма бронирования", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks([`${TOMORROW_DATE_STR}T09:00:00`], 1);
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
      expect(screen.getByRole("button", { name: /продолжить/i })).toBeDisabled();
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
      expect(screen.getByRole("button", { name: /продолжить/i })).toBeEnabled();
    });
  });
});

describe("BookingPage — создание бронирования", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks([`${TOMORROW_DATE_STR}T09:00:00`], 1);
  });

  it("создаёт бронирование при нажатии 'Продолжить'", async () => {
    setPostHandler(
      async () => new Response(JSON.stringify({ booking: createMockBooking() }), { status: 201 }),
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

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          eventTypeId: "1",
          slotStart: `${TOMORROW_DATE_STR}T09:00:00`,
          guestName: "Тест Гость",
          guestEmail: "test@example.com",
        }),
      }),
    );
  });

  it("отображает подтверждение после успешного бронирования", async () => {
    setPostHandler(
      async () =>
        new Response(
          JSON.stringify({
            booking: createMockBooking({ guestName: "Тест Гость", guestEmail: "test@example.com" }),
          }),
          { status: 201 },
        ),
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
      expect(screen.getByText(/тест гость/i)).toBeInTheDocument();
      expect(screen.getByText(/email: test@example\.com/i)).toBeInTheDocument();
    });
  });

  it("отображает 'Создание...' при отправке формы", async () => {
    // Use a deferred promise so the POST request hangs
    let resolvePost: () => void;
    const postPromise = new Promise<Response>((resolve) => {
      resolvePost = resolve;
    });
    // Delay the resolve to ensure "Создание..." is visible
    setTimeout(() => {
      resolvePost!(new Response(JSON.stringify({ booking: createMockBooking() }), { status: 201 }));
    }, 1000);

    setPostHandler(async () => postPromise);

    const user = userEvent.setup();
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await user.click(screen.getByText("09:00"));
    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));
    await waitFor(() => expect(screen.getByText("Создание...")).toBeInTheDocument());
  });

  it("отображает ошибку при конфликте (409)", async () => {
    const conflictError = new Error("Слот занят") as unknown as { status: number; message: string };
    conflictError.status = 409;
    setPostHandler(async () => {
      throw conflictError;
    });

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
    setPostHandler(async () => {
      throw genericError;
    });

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
    expect(screen.queryByRole("heading", { name: "Бронирование" })).not.toBeInTheDocument();
  });

  it("отображает ошибку и сохраняет форму при невалидном email", async () => {
    const validationError = new Error("Неверный формат email") as unknown as {
      status: number;
      message: string;
    };
    validationError.status = 400;
    setPostHandler(async () => {
      throw validationError;
    });

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
      expect(screen.getByPlaceholderText("Ваше имя")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("email@example.com")).toBeInTheDocument();
    });
  });

  it("отображает бронирование без email, если email пустой", async () => {
    setPostHandler(
      async () =>
        new Response(
          JSON.stringify({
            booking: createMockBooking({ guestName: "Тест Гость", guestEmail: undefined }),
          }),
          { status: 201 },
        ),
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

  it("очищает выбранный слот и рефетчит список после успешного бронирования", async () => {
    // Keep initial slots; clear them in the POST handler so the refetch after booking returns empty
    setPostHandler(async () => {
      customSlots = [];
      customFreeCount = 0;
      return new Response(
        JSON.stringify({
          booking: createMockBooking({
            guestName: "Тест Гость",
            guestEmail: "test@example.com",
          }),
        }),
        { status: 201 },
      );
    });

    const user = userEvent.setup();
    renderWithRouter("/booking/1");
    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: new RegExp(String(TOMORROW_DAY)) }));
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    const slotButtons = screen.getAllByRole("button", { name: /09:00/ });
    const slotButton = slotButtons.find((btn) => btn.closest(".space-y-2"));
    await user.click(slotButton!);
    await waitFor(() => expect(slotButton).toHaveClass("bg-accent"));
    await user.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await user.click(screen.getByRole("button", { name: /продолжить/i }));
    await waitFor(() => {
      expect(screen.queryByText("09:00")).not.toBeInTheDocument();
      expect(screen.getByText("Нет свободных слотов")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/бронирование создано/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /забронировать ещё/i })).toBeInTheDocument();
    });
  });
});
