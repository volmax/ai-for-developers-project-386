import { test, expect } from "@playwright/test";

test.describe("Owner view — владелец видит записи", () => {
  test("should see newly created booking on admin meetings page", async ({ page }) => {
    // Step 1: Book a slot as a guest
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Выберите тип события" })).toBeVisible();

    await page.getByRole("link", { name: /Консультация.*15 мин/ }).click();
    await expect(page).toHaveURL("/booking/1");
    await expect(page.getByRole("heading", { name: "Консультация" })).toBeVisible();

    // Select a date
    const calendarCells = page.getByRole("button").filter({
      hasText: /\d+ св\./,
    });
    await calendarCells.first().click();
    await expect(page.getByText("Выбранная дата")).toBeVisible();

    // Wait for slots to load and select the first available slot
    await page.waitForTimeout(1000);
    const firstSlot = page.getByRole("button", { name: /Свободно/ }).first();
    await expect(firstSlot).toBeVisible();
    await firstSlot.click();
    await expect(page.getByText("Выбранное время")).toBeVisible();

    // Fill in the booking form and create the booking
    await page.getByPlaceholder("Ваше имя").fill("Test Guest");
    await page.getByPlaceholder("email@example.com").fill("guest@test.com");
    await page.getByRole("button", { name: "Продолжить" }).click();

    // Verify booking was created successfully
    await expect(page.getByText("Бронирование создано!")).toBeVisible();
    await expect(page.getByText("Test Guest")).toBeVisible();

    // Extract the booked slot time from the success message
    const bookedSlotTime = await page.evaluate(() => {
      const container = document.querySelector('[class*="min-h-\\[calc')?.parentElement;
      if (!container) return null;
      const match = container.textContent?.match(/(\d{2}:\d{2})/);
      return match ? match[1] : null;
    });
    expect(bookedSlotTime).toBeTruthy();

    // Step 2: Navigate to admin page
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Панель управления" })).toBeVisible();

    // Step 3: Click on "Предстоящие встречи" to go to admin meetings page
    await page.getByRole("link", { name: "Предстоящие встречи" }).click();
    await expect(page.getByRole("heading", { name: "Предстоящие встречи" })).toBeVisible();

    // Step 4: Verify the booking appears on the admin page
    // The booking should show the event type name, guest name, and time
    await expect(page.getByText("Консультация")).toBeVisible();
    await expect(page.getByText("Test Guest")).toBeVisible();
    await expect(page.getByText("guest@test.com")).toBeVisible();

    // Verify the time is displayed (format: "ЧЧ:ММ — ЧЧ:ММ")
    const timeText = await page.getByText(bookedSlotTime!).first();
    await expect(timeText).toBeVisible();
  });

  test("should show empty state when no bookings exist", async ({ page }) => {
    // Navigate to admin meetings page with no bookings
    await page.goto("/admin/meetings");
    await expect(page.getByRole("heading", { name: "Предстоящие встречи" })).toBeVisible();

    // Should show the empty state message
    await expect(page.getByText("Нет предстоящих встреч.")).toBeVisible();
  });
});
