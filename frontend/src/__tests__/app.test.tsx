import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

describe("App", () => {
  it("renders the header with correct title", () => {
    render(<App />);
    expect(screen.getByText("AI for Developers")).toBeInTheDocument();
  });

  it("renders the button", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /нажми меня/i })).toBeInTheDocument();
  });
});
