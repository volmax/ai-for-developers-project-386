import { test, expect } from "@playwright/test";

test.describe("Cross-type event overlap — пересечение разных типов встреч", () => {
  test("should detect overlap between consultation and deep-dive events", async ({ page }) => {
    // Step 1: Book a 15-min consultation slot
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Выберите тип события" })).toBeVisible();

    // Book "Консультация" (15 min)
    await page.getByRole("link", { name: /Консультация.*15 мин/ }).click();
    await expect(page).toHaveURL("/booking/1");

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
    await page.getByPlaceholder("Ваше имя").fill("Guest One");
    await page.getByPlaceholder("email@example.com").fill("one@test.com");
    await page.getByRole("button", { name: "Продолжить" }).click();

    // Verify booking was created successfully
    await expect(page.getByText("Бронирование создано!")).toBeVisible();

    // Extract the booked slot time
    const bookedSlotTime = await page.evaluate(() => {
      const container = document.querySelector('[class*="min-h-\\[calc')?.parentElement;
      if (!container) return null;
      const match = container.textContent?.match(/(\d{2}:\d{2})/);
      return match ? match[1] : null;
    });
    expect(bookedSlotTime).toBeTruthy();

    // Step 2: Try to book the same time slot with "Глубокое погружение" (30 min)
    // Navigate to events and select the deep-dive event type
    await page.getByRole("link", { name: "Назад" }).click();
    await page.getByRole("link", { name: "Записаться" }).first().click();
    await expect(page).toHaveURL("/events");

    // Book "Глубокое погружение" (30 min)
    await page.getByRole("link", { name: /Глубокое погружение.*30 мин/ }).click();
    await expect(page).toHaveURL("/booking/2");

    // Select the same date
    const dateCells = page.getByRole("button").filter({
      hasText: /\d+ св\./,
    });
    await dateCells.first().click();
    await page.waitForTimeout(1000);

    // Try to book the same time slot via API — should get 409 Conflict
    const conflictResult = await page.evaluate(async (slotTime) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [hours, minutes] = slotTime.split(":").map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
      const isoLocal = tomorrow.toISOString().split(".")[0];

      const resp = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTypeId: "2",
          slotStart: isoLocal,
          guestName: "Cross-Type Guest",
          guestEmail: "cross@test.com",
        }),
      });

      return {
        status: resp.status,
        body: await resp.json(),
      };
    }, bookedSlotTime);

    // Verify API returns 409 Conflict even for different event types
    expect(conflictResult.status).toBe(409);
    expect(conflictResult.body.code).toBe("CONFLICT");
    expect(conflictResult.body.message).toContain("пересекается");
  });
});

test.describe("Partial overlap — частичное пересечение встреч разной длительности", () => {
  test("should detect partial overlap: 30-min booking blocks 15-min slot at boundary", async ({
    page,
  }) => {
    // Step 1: Book a 30-min deep-dive starting at the first available slot
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Выберите тип события" })).toBeVisible();

    // Book "Глубокое погружение" (30 min)
    await page.getByRole("link", { name: /Глубокое погружение.*30 мин/ }).click();
    await expect(page).toHaveURL("/booking/2");

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
    await page.getByPlaceholder("Ваше имя").fill("Deep Dive Guest");
    await page.getByPlaceholder("email@example.com").fill("deep@test.com");
    await page.getByRole("button", { name: "Продолжить" }).click();

    // Verify booking was created successfully
    await expect(page.getByText("Бронирование создано!")).toBeVisible();

    // Extract the booked slot time (start time of the 30-min booking)
    const bookedSlotStart = await page.evaluate(() => {
      const container = document.querySelector('[class*="min-h-\\[calc')?.parentElement;
      if (!container) return null;
      const match = container.textContent?.match(/(\d{2}:\d{2})/);
      return match ? match[1] : null;
    });
    expect(bookedSlotStart).toBeTruthy();

    // Calculate the end time (start + 30 minutes)
    // Used for documentation — the actual overlap check is done by the backend
    await page.evaluate((start) => {
      const [hours, minutes] = start.split(":").map(Number);
      const endMinutes = minutes + 30;
      const endHours = hours + Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
    }, bookedSlotStart!);

    // Step 2: Try to book a 15-min consultation that partially overlaps
    // The consultation should conflict if it starts within the 30-min window
    // or if it ends within the 30-min window

    // Try to book at the start time — should conflict
    const conflictAtStart = await page.evaluate(async (slotStart) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [hours, minutes] = slotStart.split(":").map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
      const isoLocal = tomorrow.toISOString().split(".")[0];

      const resp = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTypeId: "1",
          slotStart: isoLocal,
          guestName: "Partial Overlap Guest",
          guestEmail: "partial@test.com",
        }),
      });

      return {
        status: resp.status,
        body: await resp.json(),
      };
    }, bookedSlotStart);

    expect(conflictAtStart.status).toBe(409);
    expect(conflictAtStart.body.code).toBe("CONFLICT");

    // Step 3: Try to book a slot that ends inside the 30-min window
    // If the 30-min booking is 09:00-09:30, a 15-min booking at 09:15-09:30 should also conflict
    const partialOverlapTime = await page.evaluate((start) => {
      const [hours, minutes] = start.split(":").map(Number);
      // Start 15 minutes after the 30-min booking
      const newMinutes = minutes + 15;
      const newHours = hours + Math.floor(newMinutes / 60);
      const newMins = newMinutes % 60;
      return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
    }, bookedSlotStart!);

    const conflictPartial = await page.evaluate(async (slotStart) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [hours, minutes] = slotStart.split(":").map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
      const isoLocal = tomorrow.toISOString().split(".")[0];

      const resp = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTypeId: "1",
          slotStart: isoLocal,
          guestName: "Partial Overlap Guest 2",
          guestEmail: "partial2@test.com",
        }),
      });

      return {
        status: resp.status,
        body: await resp.json(),
      };
    }, partialOverlapTime);

    expect(conflictPartial.status).toBe(409);
    expect(conflictPartial.body.code).toBe("CONFLICT");
  });
});
