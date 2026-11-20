import { describe, it, expect, beforeEach, vi } from "vitest";

// Create a mock fetch function
const mockFetch = vi.fn();
Object.defineProperty(globalThis, "fetch", {
  value: mockFetch,
  writable: true,
  configurable: true,
});

beforeEach(() => {
  mockFetch.mockReset();
});

// Import SDK functions (they use fetch directly)
import {
  getUpcomingBookings,
  createBooking,
  getAvailableSlots,
  getFreeSlotsCount,
  getEventTypes,
  createEventType,
  ApiError,
} from "@/services/sdk";

describe("SDK function signatures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
  });

  it("getUpcomingBookings calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }]), { status: 200 }));

    const { status, data } = await getUpcomingBookings();
    expect(status).toBe(200);
    expect(data).toEqual([{ id: 1 }]);
    expect(mockFetch).toHaveBeenCalledWith("/api/bookings/upcoming", {});
  });

  it("createBooking calls correct endpoint with body", async () => {
    const body = {
      eventTypeId: "1",
      slotStart: "2026-11-16T10:00:00",
      guestName: "Test",
      guestEmail: "test@example.com",
    };
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 201 }));

    const { status, data } = await createBooking({ body });
    expect(status).toBe(201);
    expect(data).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  });

  it("createBooking throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Conflict" }), {
        status: 409,
      }),
    );

    await expect(
      createBooking({
        body: {
          eventTypeId: "1",
          slotStart: "2026-11-16T10:00:00",
          guestName: "Test",
        },
      }),
    ).rejects.toThrow(ApiError);
  });

  it("getAvailableSlots calls correct endpoint with query params", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(["09:00", "09:15"]), { status: 200 }),
    );

    const { status, data } = await getAvailableSlots({
      query: { eventTypeId: "1", date: "2026-11-16" },
    });
    expect(status).toBe(200);
    expect(data).toEqual(["09:00", "09:15"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings/available-slots?eventTypeId=1&date=2026-11-16",
      {},
    );
  });

  it("getFreeSlotsCount calls correct endpoint with query params", async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ count: 12 }), { status: 200 }));

    const { status, data } = await getFreeSlotsCount({
      query: { eventTypeId: "1", date: "2026-11-16" },
    });
    expect(status).toBe(200);
    expect(data).toEqual({ count: 12 });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings/free-slots-count?eventTypeId=1&date=2026-11-16",
      {},
    );
  });

  it("getEventTypes calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: 1, name: "15 мин", durationMinutes: 15 }]), {
        status: 200,
      }),
    );

    const { status, data } = await getEventTypes();
    expect(status).toBe(200);
    expect(data).toEqual([{ id: 1, name: "15 мин", durationMinutes: 15 }]);
    expect(mockFetch).toHaveBeenCalledWith("/api/event-types", {});
  });

  it("createEventType calls correct endpoint with body", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 3, name: "60 мин", durationMinutes: 60 }), { status: 201 }),
    );

    const body = { name: "60 мин", description: "Desc", durationMinutes: 60 };
    const { status, data } = await createEventType({ body });
    expect(status).toBe(201);
    expect(data).toEqual({ id: 3, name: "60 мин", durationMinutes: 60 });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/event-types",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });
});
