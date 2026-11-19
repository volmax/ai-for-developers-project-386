import type { components } from "../../typespec/generated/client/types";

type Booking = components["schemas"]["Booking"];
type EventType = components["schemas"]["EventType"];
type BookingRequest = components["schemas"]["BookingRequest"];
type BookingCreated = components["schemas"]["BookingCreated"];
type FreeSlotsCountResult = components["schemas"]["FreeSlotsCountResult"];

const API_BASE = "/api";

class ApiClient {
  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      let errorMessage = `API error ${res.status}: ${res.statusText}`;
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use default error message
      }
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      throw error;
    }
    return res.json();
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }
}

export const api = new ApiClient();

export async function getEventTypes(): Promise<EventType[]> {
  return api.get<EventType[]>("/event-types");
}

export async function createBooking(request: BookingRequest): Promise<Booking> {
  const response = await api.post<BookingCreated>("/bookings", request);
  return response.booking;
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  return api.get<Booking[]>("/bookings/upcoming");
}

export async function getAvailableSlots(eventTypeId: string, date: string): Promise<string[]> {
  return api.get<string[]>(`/bookings/available-slots?eventTypeId=${eventTypeId}&date=${date}`);
}

export async function getFreeSlotsCount(eventTypeId: string, date: string): Promise<number> {
  const response = await api.get<FreeSlotsCountResult>(
    `/bookings/free-slots-count?eventTypeId=${eventTypeId}&date=${date}`,
  );
  return response.count;
}

export async function createEventType(request: {
  name: string;
  description: string;
  durationMinutes: number;
}): Promise<EventType> {
  const response = await api.post<{ eventType: EventType }>("/event-types", request);
  return response.eventType;
}

export type { Booking, EventType, BookingRequest };
