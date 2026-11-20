import type { components } from "../../typespec/generated/client/types";
import * as sdk from "@/services/sdk";

// Re-export SDK functions
export const {
  getUpcomingBookings,
  createBooking,
  getAvailableSlots,
  getFreeSlotsCount,
  getEventTypes,
  createEventType,
} = sdk;

// Type aliases (backward-compatible)
export type Booking = components["schemas"]["Booking"];
export type EventType = components["schemas"]["EventType"];
export type BookingRequest = components["schemas"]["BookingRequest"];
