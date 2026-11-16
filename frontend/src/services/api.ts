const API_BASE = "/api";

export interface EventType {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Booking {
  id: number;
  eventTypeId: string;
  eventTypeName: string;
  eventDurationMinutes: number;
  slotStart: string;
  slotEnd: string;
  guestName: string;
  guestEmail: string | null;
  createdAt: string;
}

export interface BookingRequest {
  eventTypeId: string;
  slotStart: string;
  guestName: string;
  guestEmail?: string;
}

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
  return api.post<Booking>("/bookings/", request);
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  return api.get<Booking[]>("/bookings/upcoming");
}

export async function getAvailableSlots(eventTypeId: string, date: string): Promise<string[]> {
  return api.get<string[]>(`/bookings/available-slots?eventTypeId=${eventTypeId}&date=${date}`);
}

export async function getFreeSlotsCount(eventTypeId: string, date: string): Promise<number> {
  return api.get<number>(`/bookings/free-slots-count?eventTypeId=${eventTypeId}&date=${date}`);
}
