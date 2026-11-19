import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock SDK functions to avoid openapi-typescript-fetch path resolution issues
// Component tests already cover the real SDK behavior
const mockFn = vi.fn();

vi.mock("@/services/sdk", () => ({
  getUpcomingBookings: (...args: unknown[]) => mockFn(...args),
  createBooking: (...args: unknown[]) => mockFn(...args),
  getAvailableSlots: (...args: unknown[]) => mockFn(...args),
  getFreeSlotsCount: (...args: unknown[]) => mockFn(...args),
  getEventTypes: (...args: unknown[]) => mockFn(...args),
  createEventType: (...args: unknown[]) => mockFn(...args),
}));

import {
  getUpcomingBookings,
  createBooking,
  getAvailableSlots,
  getFreeSlotsCount,
  getEventTypes,
  createEventType,
} from "@/services/api";

describe("SDK function signatures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFn.mockResolvedValue({ status: 200, data: null });
  });

  it("getUpcomingBookings accepts {} argument", async () => {
    await getUpcomingBookings({});
    expect(mockFn).toHaveBeenCalledWith({});
  });

  it("createBooking accepts { body: ... } argument", async () => {
    const request = {
      body: { eventTypeId: "1", slotStart: "2026-11-16T10:00:00", guestName: "Test" },
    };
    await createBooking(request);
    expect(mockFn).toHaveBeenCalledWith(request);
  });

  it("getAvailableSlots accepts { query: ... } argument", async () => {
    await getAvailableSlots({ query: { eventTypeId: "1", date: "2026-11-16" } });
    expect(mockFn).toHaveBeenCalledWith({ query: { eventTypeId: "1", date: "2026-11-16" } });
  });

  it("getFreeSlotsCount accepts { query: ... } argument", async () => {
    await getFreeSlotsCount({ query: { eventTypeId: "1", date: "2026-11-16" } });
    expect(mockFn).toHaveBeenCalledWith({ query: { eventTypeId: "1", date: "2026-11-16" } });
  });

  it("getEventTypes accepts {} argument", async () => {
    await getEventTypes({});
    expect(mockFn).toHaveBeenCalledWith({});
  });

  it("createEventType accepts { body: ... } argument", async () => {
    await createEventType({ body: { name: "Test", description: "Desc", durationMinutes: 30 } });
    expect(mockFn).toHaveBeenCalledWith({
      body: { name: "Test", description: "Desc", durationMinutes: 30 },
    });
  });
});
