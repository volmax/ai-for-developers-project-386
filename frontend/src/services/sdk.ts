import { Fetcher } from "openapi-typescript-fetch";
import type { paths, components, operations } from "../../../typespec/generated/client/types";

export type { paths, components, operations };

const fetcher = Fetcher.for<paths>();

fetcher.configure({
  baseUrl: "/api",
  init: { headers: { "Content-Type": "application/json" } },
});

export const getUpcomingBookings = fetcher.path("/bookings/upcoming").method("get").create();

export const createBooking = fetcher.path("/bookings").method("post").create();

export const getAvailableSlots = fetcher
  .path("/bookings/available-slots")
  .method("get")
  .create();

export const getFreeSlotsCount = fetcher
  .path("/bookings/free-slots-count")
  .method("get")
  .create();

export const getEventTypes = fetcher.path("/event-types").method("get").create();

export const createEventType = fetcher.path("/event-types").method("post").create();
