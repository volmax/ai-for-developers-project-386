import { describe, it, expect, vi, beforeEach } from "vitest";

declare global {
  // eslint-disable-next-line no-var
  var mockFetch: ReturnType<typeof vi.fn>;
}
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CreateEventTypePage } from "@/components/pages/CreateEventTypePage";

const mockFetch = globalThis.mockFetch as ReturnType<typeof vi.fn>;
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/admin/event-types/new"]}>
      <CreateEventTypePage />
    </MemoryRouter>,
  );
}

describe("CreateEventTypePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("отображает заголовок формы", () => {
    renderPage();
    expect(screen.getByText("Новый тип встречи")).toBeInTheDocument();
  });

  it("отображает все поля формы", () => {
    renderPage();
    expect(screen.getByLabelText(/название/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/длительность/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /создать тип встречи/i })).toBeInTheDocument();
  });

  it("отображает выпадающий список с вариантами длительности", () => {
    renderPage();
    const select = screen.getByLabelText(/длительность/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => Number(o.value));

    expect(options).toContain(15);
    expect(options).toContain(30);
    expect(options).toContain(60);
    expect(options).toContain(540);

    for (let i = 1; i < options.length; i++) {
      expect(options[i] - options[i - 1]).toBe(15);
    }
  });

  it("отправляет форму и перенаправляет на /events при успехе", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 1,
          name: "Менторство",
          description: "Описание",
          durationMinutes: 60,
        }),
        { status: 201 },
      ),
    );

    renderPage();

    fireEvent.change(screen.getByLabelText(/название/i), { target: { value: "Менторство" } });
    fireEvent.change(screen.getByLabelText(/описание/i), {
      target: { value: "Персональное менторство" },
    });
    fireEvent.change(screen.getByLabelText(/длительность/i), { target: { value: "60" } });

    fireEvent.click(screen.getByRole("button", { name: /создать тип встречи/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/events"));
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/event-types",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Менторство",
          description: "Персональное менторство",
          durationMinutes: 60,
        }),
      }),
    );
  });

  it("отображает ошибку при неудачном создании", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Тип события уже существует"));

    renderPage();

    fireEvent.change(screen.getByLabelText(/название/i), { target: { value: "Консультация" } });
    fireEvent.change(screen.getByLabelText(/описание/i), { target: { value: "Описание" } });
    fireEvent.click(screen.getByRole("button", { name: /создать тип встречи/i }));

    await waitFor(() => expect(screen.getByText("Тип события уже существует")).toBeInTheDocument());
  });

  it("деактивирует кнопку на время отправки", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderPage();

    fireEvent.change(screen.getByLabelText(/название/i), { target: { value: "Тест" } });
    fireEvent.change(screen.getByLabelText(/описание/i), { target: { value: "Тест" } });
    fireEvent.click(screen.getByRole("button", { name: /создать тип встречи/i }));

    expect(screen.getByText("Создание...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
