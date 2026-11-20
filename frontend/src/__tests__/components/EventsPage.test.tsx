import { describe, it, expect, vi, beforeEach } from "vitest";

declare global {
  // eslint-disable-next-line no-var
  var mockFetch: ReturnType<typeof vi.fn>;
}
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { EventsPage } from "@/components/pages/EventsPage";

const mockFetch = globalThis.mockFetch as ReturnType<typeof vi.fn>;

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/events"]}>
      <EventsPage />
    </MemoryRouter>,
  );
}

describe("EventsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("отображает 'Загрузка...' при загрузке", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderPage();
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it("отображает карточки событий после загрузки", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: 1,
            name: "Встреча 15 минут",
            description: "Короткий тип события для быстрого слота",
            durationMinutes: 15,
          },
          {
            id: 2,
            name: "Встреча 30 минут",
            description: "Базовый тип события для бронирования",
            durationMinutes: 30,
          },
        ]),
        { status: 200 },
      ),
    );

    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    expect(screen.getByText("Выберите тип события")).toBeInTheDocument();
    expect(
      screen.getByText("Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот"),
    ).toBeInTheDocument();

    expect(screen.getByText("Встреча 15 минут")).toBeInTheDocument();
    expect(screen.getByText("15 мин")).toBeInTheDocument();
    expect(screen.getByText("Короткий тип события для быстрого слота")).toBeInTheDocument();

    expect(screen.getByText("Встреча 30 минут")).toBeInTheDocument();
    expect(screen.getByText("30 мин")).toBeInTheDocument();
    expect(screen.getByText("Базовый тип события для бронирования")).toBeInTheDocument();
  });

  it("переходит на /booking/:eventTypeId при клике на карточку", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: 1,
            name: "Встреча 15 минут",
            description: "Короткий тип события",
            durationMinutes: 15,
          },
        ]),
        { status: 200 },
      ),
    );

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    const link = screen.getByRole("link", { name: /встреча 15 минут/i });
    expect(link).toHaveAttribute("href", "/booking/1");

    await user.click(link);

    expect(link).toHaveAttribute("href", "/booking/1");
  });

  it("отображает сообщение об ошибке при ошибке загрузки", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Ошибка сети"));

    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    expect(screen.getByText("Ошибка загрузки")).toBeInTheDocument();
    expect(screen.getByText("Ошибка сети")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /попробовать снова/i })).toBeInTheDocument();
  });

  it("отображает 'Нет доступных событий', если список пуст", async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    renderPage();

    await waitFor(() => expect(screen.queryByText("Загрузка...")).not.toBeInTheDocument());

    expect(screen.getByText("Нет доступных событий.")).toBeInTheDocument();
  });
});
