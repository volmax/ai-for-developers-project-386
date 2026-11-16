import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminMeetingsPage } from "@/components/pages/AdminMeetingsPage";
import type { Booking } from "@/services/api";

const mockGetUpcomingBookings = vi.fn();

vi.mock("@/services/api", () => ({
  getUpcomingBookings: (...args: unknown[]) => mockGetUpcomingBookings(...args),
}));

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/admin/meetings"]}>
      <AdminMeetingsPage />
    </MemoryRouter>,
  );
}

function createMockBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 1,
    eventTypeId: "1",
    eventTypeName: "Встреча 15 минут",
    eventDurationMinutes: 15,
    slotStart: "2026-11-16T10:00:00",
    slotEnd: "2026-11-16T10:15:00",
    guestName: "Тест Гость",
    guestEmail: "test@example.com",
    createdAt: "2026-11-15T10:00:00",
    ...overrides,
  };
}

describe("AdminMeetingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("отображает 'Загрузка...' при загрузке", () => {
    mockGetUpcomingBookings.mockReturnValue(new Promise(() => {})); // never resolves

    renderPage();
    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  it("отображает заголовок 'Предстоящие встречи'", async () => {
    mockGetUpcomingBookings.mockResolvedValue([]);

    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    expect(screen.getByText("Предстоящие встречи")).toBeInTheDocument();
  });

  it("отображает список встреч при наличии бронирований", async () => {
    mockGetUpcomingBookings.mockResolvedValue([
      createMockBooking({
        id: 1,
        guestName: "Иван Петров",
        guestEmail: "ivan@example.com",
        eventTypeName: "Встреча 15 минут",
        eventDurationMinutes: 15,
        slotStart: "2026-11-16T10:00:00",
        slotEnd: "2026-11-16T10:15:00",
      }),
      createMockBooking({
        id: 2,
        guestName: "Мария Сидорова",
        guestEmail: undefined,
        eventTypeName: "Встреча 30 минут",
        eventDurationMinutes: 30,
        slotStart: "2026-11-17T14:00:00",
        slotEnd: "2026-11-17T14:30:00",
      }),
    ]);

    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    // Verify event names and durations
    expect(screen.getByText("Встреча 15 минут")).toBeInTheDocument();
    expect(screen.getByText("15 мин")).toBeInTheDocument();
    expect(screen.getByText("Встреча 30 минут")).toBeInTheDocument();
    expect(screen.getByText("30 мин")).toBeInTheDocument();

    // Verify guest names
    expect(screen.getByText("Иван Петров")).toBeInTheDocument();
    expect(screen.getByText("Мария Сидорова")).toBeInTheDocument();

    // Verify emails
    expect(screen.getByText("ivan@example.com")).toBeInTheDocument();

    // Verify times (rendered as "10:00 — 10:15" in one element)
    expect(screen.getByText(/10:00/i)).toBeInTheDocument();
    expect(screen.getByText(/10:15/i)).toBeInTheDocument();
    expect(screen.getByText(/14:00/i)).toBeInTheDocument();
    expect(screen.getByText(/14:30/i)).toBeInTheDocument();
  });

  it("не отображает email, если он не указан", async () => {
    mockGetUpcomingBookings.mockResolvedValue([
      createMockBooking({
        guestEmail: undefined,
      }),
    ]);

    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    expect(screen.getByText("Тест Гость")).toBeInTheDocument();
    expect(screen.queryByText("test@example.com")).not.toBeInTheDocument();
  });

  it("отображает сообщение об ошибке при ошибке загрузки", async () => {
    mockGetUpcomingBookings.mockRejectedValue(new Error("Ошибка сети"));

    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    expect(screen.getByText("Ошибка загрузки")).toBeInTheDocument();
    expect(screen.getByText("Ошибка сети")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /попробовать снова/i })).toBeInTheDocument();
  });

  it("отображает 'Нет предстоящих встреч', если список пуст", async () => {
    mockGetUpcomingBookings.mockResolvedValue([]);

    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    expect(screen.getByText("Нет предстоящих встреч.")).toBeInTheDocument();
  });
});
