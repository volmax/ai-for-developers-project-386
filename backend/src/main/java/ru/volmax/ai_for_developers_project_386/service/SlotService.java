package ru.volmax.ai_for_developers_project_386.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import ru.volmax.ai_for_developers_project_386.entity.Booking;
import ru.volmax.ai_for_developers_project_386.entity.EventType;
import ru.volmax.ai_for_developers_project_386.repository.BookingRepository;
import ru.volmax.ai_for_developers_project_386.repository.EventTypeRepository;

@Service
public class SlotService {

    private static final LocalTime WORK_START = LocalTime.of(9, 0);
    private static final LocalTime WORK_END = LocalTime.of(18, 0);

    private final BookingRepository bookingRepository;
    private final EventTypeRepository eventTypeRepository;

    public SlotService(
            BookingRepository bookingRepository, EventTypeRepository eventTypeRepository) {
        this.bookingRepository = bookingRepository;
        this.eventTypeRepository = eventTypeRepository;
    }

    /**
     * Calculate all available (free) slot start times for a given event type on a specific date.
     *
     * @param eventTypeId the event type ID
     * @param date the date to calculate slots for
     * @return list of free slot start times (ISO 8601 format)
     */
    public List<String> calculateAvailableSlots(String eventTypeId, LocalDate date) {
        var eventTypeOpt = eventTypeRepository.findById(Long.parseLong(eventTypeId));
        if (eventTypeOpt.isEmpty()) {
            return List.of();
        }

        EventType eventType = eventTypeOpt.get();
        int durationMinutes = eventType.getDurationMinutes();

        // Generate all candidate slots within working hours
        List<LocalDateTime> candidates = generateCandidateSlots(date, durationMinutes);

        // Fetch all bookings for the day
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
        List<Booking> dayBookings = bookingRepository.findBookingsForDay(dayStart, dayEnd);

        // Filter out slots that overlap with any existing booking
        List<LocalDateTime> freeSlots = new ArrayList<>();
        for (LocalDateTime candidate : candidates) {
            LocalDateTime candidateEnd = candidate.plusMinutes(durationMinutes);
            boolean isOverlapping = false;
            for (Booking booking : dayBookings) {
                if (isOverlapping(
                        candidate, candidateEnd, booking.getSlotStart(), booking.getSlotEnd())) {
                    isOverlapping = true;
                    break;
                }
            }
            if (!isOverlapping) {
                freeSlots.add(candidate);
            }
        }

        return freeSlots.stream().map(slot -> slot.toString()).toList();
    }

    /** Count the number of free slots for a given event type on a specific date. */
    public int countFreeSlots(String eventTypeId, LocalDate date) {
        return calculateAvailableSlots(eventTypeId, date).size();
    }

    /**
     * Generate all candidate slot start times within working hours for a given duration.
     *
     * @param date the date
     * @param durationMinutes the slot duration in minutes
     * @return list of candidate slot start times
     */
    List<LocalDateTime> generateCandidateSlots(LocalDate date, int durationMinutes) {
        List<LocalDateTime> slots = new ArrayList<>();
        LocalDateTime current = date.atTime(WORK_START);
        LocalDateTime end = date.atTime(WORK_END);

        while (current.isBefore(end)) {
            // Skip weekends
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY
                    && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                // Only add slot if it doesn't exceed working hours
                LocalDateTime slotEnd = current.plusMinutes(durationMinutes);
                if (slotEnd.isBefore(end) || slotEnd.equals(end)) {
                    slots.add(current);
                }
            }
            current = current.plusMinutes(durationMinutes);
        }

        return slots;
    }

    /**
     * Check if two time intervals overlap. Two intervals overlap if one starts before the other
     * ends. Example: 10:00-11:00 overlaps with 10:30-11:00 Example: 10:00-11:00 does NOT overlap
     * with 11:00-12:00
     */
    boolean isOverlapping(
            LocalDateTime start1, LocalDateTime end1, LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}
