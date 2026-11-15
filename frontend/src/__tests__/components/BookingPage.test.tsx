import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { BookingPage } from "@/components/pages/BookingPage";

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

describe("BookingPage — кнопка 'Забронировать ещё'", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetEventTypes.mockResolvedValue([
      {
        id: "1",
        name: "Встреча 15 минут",
        description: "Короткий тип события",
        durationMinutes: 15,
      },
    ]);

    mockGetAvailableSlots.mockResolvedValue(["2026-11-16T09:00:00", "2026-11-16T09:15:00"]);

    mockGetFreeSlotsCount.mockResolvedValue(2);
  });

  it("отображает кнопку 'Забронировать ещё' после успешного бронирования", async () => {
    mockCreateBooking.mockResolvedValue({
      id: 1,
      eventTypeId: "1",
      eventTypeName: "Встреча 15 минут",
      eventDurationMinutes: 15,
      slotStart: "2026-11-16T09:00:00",
      slotEnd: "2026-11-16T09:15:00",
      guestName: "Тест Гость",
      guestEmail: "test@example.com",
      createdAt: "2026-11-15T10:00:00",
    });

    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    // Select a date in the calendar (day 16)
    await userEvent.click(screen.getByRole("button", { name: /16/ }));

    // Click on a slot
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await userEvent.click(screen.getByText("09:00"));

    // Fill the form
    await userEvent.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");
    await userEvent.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");

    // Submit booking
    await userEvent.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => expect(mockCreateBooking).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/бронирование создано/i)).toBeInTheDocument());

    // Verify the "Забронировать ещё" button is present
    await waitFor(() => {
      const bookAgainButton = screen.getByRole("link", { name: /забронировать ещё/i });
      expect(bookAgainButton).toBeInTheDocument();
      expect(bookAgainButton).toHaveAttribute("href", "/events");
    });
  });

  it("переходит на /events при нажатии кнопки 'Забронировать ещё'", async () => {
    mockCreateBooking.mockResolvedValue({
      id: 1,
      eventTypeId: "1",
      eventTypeName: "Встреча 15 минут",
      eventDurationMinutes: 15,
      slotStart: "2026-11-16T09:00:00",
      slotEnd: "2026-11-16T09:15:00",
      guestName: "Тест Гость",
      guestEmail: null,
      createdAt: "2026-11-15T10:00:00",
    });

    renderWithRouter("/booking/1");

    await waitFor(() => expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument());

    // Select a date in the calendar
    await userEvent.click(screen.getByRole("button", { name: /16/ }));

    // Click on a slot
    await waitFor(() => expect(screen.getByText("09:00")).toBeInTheDocument());
    await userEvent.click(screen.getByText("09:00"));

    // Fill the form
    await userEvent.type(screen.getByPlaceholderText("Ваше имя"), "Тест Гость");

    // Submit booking
    await userEvent.click(screen.getByRole("button", { name: /продолжить/i }));

    await waitFor(() => expect(screen.getByText(/бронирование создано/i)).toBeInTheDocument());

    // Click the "Забронировать ещё" button
    await waitFor(() => {
      const bookAgainButton = screen.getByRole("link", { name: /забронировать ещё/i });
      expect(bookAgainButton).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("link", { name: /забронировать ещё/i }));

    await waitFor(() => expect(screen.getByText("Events Page")).toBeInTheDocument());
  });
});
