import type { components } from "../../typespec/generated/client/types";

// Build URL with query parameters manually (openapi-typescript-fetch doesn't support query params correctly)
function buildUrl(path: string, query?: Record<string, string>): string {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(url: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.message || response.statusText);
  }
  const data = await response.json();
  return { status: response.status, data };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type Booking = components["schemas"]["Booking"];
export type EventType = components["schemas"]["EventType"];
export type BookingRequest = components["schemas"]["BookingRequest"];

export async function getUpcomingBookings(): Promise<{
  status: number;
  data: Booking[];
}> {
  return request<Booking[]>("/api/bookings/upcoming", {});
}

export async function createBooking(params: {
  body: BookingRequest;
}): Promise<{ status: number; data: components["schemas"]["BookingCreated"] }> {
  return request<components["schemas"]["BookingCreated"]>("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.body),
  });
}

export async function getAvailableSlots(params: {
  query: { eventTypeId: string; date: string };
}): Promise<{ status: number; data: string[] }> {
  return request<string[]>(buildUrl("/api/bookings/available-slots", params.query), {});
}

export async function getFreeSlotsCount(params: {
  query: { eventTypeId: string; date: string };
}): Promise<{
  status: number;
  data: components["schemas"]["FreeSlotsCountResult"];
}> {
  return request<components["schemas"]["FreeSlotsCountResult"]>(
    buildUrl("/api/bookings/free-slots-count", params.query),
    {},
  );
}

export async function getEventTypes(): Promise<{
  status: number;
  data: EventType[];
}> {
  return request<EventType[]>("/api/event-types", {});
}

export async function createEventType(params: {
  body: components["schemas"]["EventTypeCreate"];
}): Promise<{
  status: number;
  data: components["schemas"]["EventTypeCreated"];
}> {
  return request<components["schemas"]["EventTypeCreated"]>("/api/event-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.body),
  });
}
