import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("App", () => {
  it("renders the header with Calendar title", () => {
    renderWithRouter(<App />);
    const links = screen.getAllByRole("link");
    const calendarLink = links.find((link) => link.textContent === "Calendar");
    expect(calendarLink).toBeInTheDocument();
  });

  it("renders the Записаться button", () => {
    renderWithRouter(<App />);
    expect(screen.getByRole("button", { name: /записаться/i })).toBeInTheDocument();
  });
});
