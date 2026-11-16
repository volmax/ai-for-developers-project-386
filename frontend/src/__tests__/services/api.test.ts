import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  api,
  getUpcomingBookings,
  getAvailableSlots,
  getFreeSlotsCount,
  createBooking,
} from "@/services/api";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("ApiClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ status: "ok" }),
    });

    const result = await api.get("/health");
    expect(result).toEqual({ status: "ok" });
    expect(mockFetch).toHaveBeenCalledWith("/api/health", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "",
    });

    await expect(api.get("/health")).rejects.toThrow("API error 500: Internal Server Error");
  });

  it("throws with error message from response body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      statusText: "Conflict",
      text: async () => '{"code":"CONFLICT","message":"Слот занят"}',
    });

    await expect(api.get("/health")).rejects.toThrow("Слот занят");
  });

  it("sends JSON body on POST", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ created: true }),
    });

    const result = await api.post("/items", { name: "test" });
    expect(result).toEqual({ created: true });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/items",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "test" }),
      }),
    );
  });
});

describe("Booking API helpers", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("getUpcomingBookings calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => [{ id: 1, eventTypeName: "Консультация" }],
    });

    const result = await getUpcomingBookings();
    expect(result).toEqual([{ id: 1, eventTypeName: "Консультация" }]);
    expect(mockFetch).toHaveBeenCalledWith("/api/bookings/upcoming", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("getAvailableSlots calls correct endpoint with params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ["2026-11-16T09:00", "2026-11-16T09:15"],
    });

    const result = await getAvailableSlots("1", "2026-11-16");
    expect(result).toEqual(["2026-11-16T09:00", "2026-11-16T09:15"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings/available-slots?eventTypeId=1&date=2026-11-16",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  it("getFreeSlotsCount calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ count: 12 }),
    });

    const result = await getFreeSlotsCount("1", "2026-11-16");
    expect(result).toBe(12);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings/free-slots-count?eventTypeId=1&date=2026-11-16",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  it("createBooking calls correct endpoint with request body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      statusText: "Created",
      json: async () => ({ booking: { id: 1, eventTypeId: "1", guestName: "Test" } }),
    });

    const request = {
      eventTypeId: "1",
      slotStart: "2026-11-16T10:00:00",
      guestName: "Test Guest",
      guestEmail: "test@example.com",
    };
    const result = await createBooking(request);
    expect(result).toEqual({ id: 1, eventTypeId: "1", guestName: "Test" });
    expect(mockFetch).toHaveBeenCalledWith("/api/bookings/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  });
});
