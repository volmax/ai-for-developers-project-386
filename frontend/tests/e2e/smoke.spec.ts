import { test, expect } from "@playwright/test";

test.describe("Smoke Test — полный путь бронирования", () => {
  test.beforeAll(async ({ request }) => {
    await test.step("Reset database state", async () => {
      await request.post("/api/admin/reset");
    });
  });

  test("should book a consultation from homepage", async ({ page }) => {
    // Step 1: Start from homepage
    await page.goto("/");

    // Verify homepage content
    await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();
    await expect(page.getByText("Забронируйте встречу за минуту")).toBeVisible();

    // Step 2: Click "Записаться" button → navigate to /events
    await page.getByRole("link", { name: "Записаться" }).first().click();
    await expect(page).toHaveURL("/events");

    // Verify events page
    await expect(page.getByRole("heading", { name: "Выберите тип события" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Консультация" })).toBeVisible();
    await expect(page.getByText("Глубокое погружение")).toBeVisible();

    // Step 3: Click "Консультация" card → navigate to /booking/1
    await page.getByRole("link", { name: /Консультация.*15 мин/ }).click();
    await expect(page).toHaveURL("/booking/1");

    // Verify booking page loaded
    await expect(page.getByRole("heading", { name: "Консультация" })).toBeVisible();
    await expect(page.getByText("15 мин")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Календарь" })).toBeVisible();

    // Step 4: Select a date in the calendar
    // The booking window is today + 14 days. Pick a date within the current month.
    // Find the first available date cell (not disabled) and click it.
    const calendarCells = page.getByRole("button").filter({ hasText: /\d+ св\./ });
    const firstAvailableDate = calendarCells.first();
    await firstAvailableDate.click();

    // Verify date selection
    await expect(page.getByText("Выбранная дата")).toBeVisible();

    // Step 5: Select a time slot
    // Wait for slots to load after date selection
    await page
      .getByRole("button", { name: /Свободно/ })
      .first()
      .waitFor({ timeout: 10000 });

    // Click the first available slot
    const firstSlot = page.getByRole("button", { name: /Свободно/ }).first();
    await firstSlot.click();

    // Verify slot selection
    await expect(page.getByText("Выбранное время")).toBeVisible();

    // Step 6: Fill in the booking form
    await page.getByPlaceholder("Ваше имя").fill("Тестовый Гость");
    await page.getByPlaceholder("email@example.com").fill("test@example.com");

    // Step 7: Click "Продолжить" to create booking
    await page.getByRole("button", { name: "Продолжить" }).click();

    // Step 8: Verify booking was created
    await expect(page.getByText("Бронирование создано!")).toBeVisible();
    await expect(page.getByText("Тестовый Гость")).toBeVisible();
    await expect(page.getByText("test@example.com")).toBeVisible();

    // Step 9: Verify the booked slot (09:00) disappears from the list (issue #36)
    await page.waitForTimeout(1000);
    await expect(page.getByRole("button", { name: "09:00" })).not.toBeVisible();

    // Step 10: Verify "Забронировать ещё" button is present and links to /events
    await expect(page.getByRole("link", { name: "Забронировать ещё" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Забронировать ещё" })).toHaveAttribute(
      "href",
      "/events",
    );

    // Step 11: Click "Забронировать ещё" → navigate to events page
    await page.getByRole("link", { name: "Забронировать ещё" }).click();
    await expect(page).toHaveURL("/events");
    await expect(page.getByRole("heading", { name: "Выберите тип события" })).toBeVisible();
  });
});
