import { test, expect } from "@playwright/test";

test.describe("EventsPage E2E", () => {
  test("should display two event type cards with correct names and durations", async ({ page }) => {
    await page.goto("/events");

    // Check that "Консультация" card is visible
    await expect(page.getByRole("heading", { name: "Типы событий" })).toBeVisible();

    // Check that both event cards are visible
    await expect(page.getByText("Консультация")).toBeVisible();
    await expect(page.getByText("Глубокое погружение")).toBeVisible();

    // Check durations
    await expect(page.getByText("15 мин")).toBeVisible();
    await expect(page.getByText("30 мин")).toBeVisible();

    // Verify each card has the correct name + duration combination
    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(2);

    // First card: "Консультация" with "15 мин"
    await expect(cards.first()).toContainText("Консультация");
    await expect(cards.first()).toContainText("15 мин");

    // Second card: "Глубокое погружение" with "30 мин"
    await expect(cards.last()).toContainText("Глубокое погружение");
    await expect(cards.last()).toContainText("30 мин");
  });
});
