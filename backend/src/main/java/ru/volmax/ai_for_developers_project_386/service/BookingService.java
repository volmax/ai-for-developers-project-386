package ru.volmax.ai_for_developers_project_386.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ru.volmax.ai_for_developers_project_386.data.BookingRequest;
import ru.volmax.ai_for_developers_project_386.entity.Booking;
import ru.volmax.ai_for_developers_project_386.entity.EventType;
import ru.volmax.ai_for_developers_project_386.repository.BookingRepository;
import ru.volmax.ai_for_developers_project_386.repository.EventTypeRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventTypeRepository eventTypeRepository;
    private final SlotService slotService;

    public BookingService(
            BookingRepository bookingRepository,
            EventTypeRepository eventTypeRepository,
            SlotService slotService) {
        this.bookingRepository = bookingRepository;
        this.eventTypeRepository = eventTypeRepository;
        this.slotService = slotService;
    }

    /** Create a new booking with pessimistic locking to prevent concurrent double-booking. */
    @Transactional
    public Booking create(BookingRequest request) {
        // A. Validate booking window: tomorrow (inclusive) to 14 days from tomorrow (inclusive)
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Moscow"));
        LocalDate windowStart = today.plusDays(1);
        LocalDate windowEnd = today.plusDays(15).minusDays(1);

        LocalDate requestedDate = request.getSlotStart().toLocalDate();

        if (requestedDate.isBefore(windowStart) || requestedDate.isAfter(windowEnd)) {
            throw new IllegalStateException(
                    "Бронирование возможно только с "
                            + windowStart
                            + " по "
                            + windowEnd
                            + " включительно");
        }

        // B. Look up event type
        Long eventTypeId = Long.parseLong(request.getEventTypeId());
        EventType eventType =
                eventTypeRepository
                        .findById(eventTypeId)
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Тип события не найден: "
                                                        + request.getEventTypeId()));

        int durationMinutes = eventType.getDurationMinutes();
        LocalDateTime slotStart = request.getSlotStart();
        LocalDateTime slotEnd = slotStart.plusMinutes(durationMinutes);

        // C. Pessimistic locking: lock overlapping bookings to prevent race conditions
        List<Booking> overlappingBookings =
                bookingRepository.findBySlotStartBeforeAndSlotEndForUpdate(slotStart, slotEnd);

        // D. Overlap detection (re-check against locked rows)
        for (Booking existing : overlappingBookings) {
            if (slotService.isOverlapping(
                    slotStart, slotEnd, existing.getSlotStart(), existing.getSlotEnd())) {
                throw new IllegalStateException(
                        "Выбранное время пересекается с существующим бронированием");
            }
        }

        // E. Create and save booking
        Booking booking =
                new Booking(
                        null,
                        request.getEventTypeId(),
                        eventType.getName(),
                        durationMinutes,
                        slotStart,
                        slotEnd,
                        request.getGuestName(),
                        request.getGuestEmail(),
                        LocalDateTime.now(ZoneId.of("Europe/Moscow")));

        return bookingRepository.save(booking);
    }

    /** Get upcoming bookings (today and future). */
    public List<Booking> getUpcoming() {
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Moscow"));
        LocalDateTime fromDateTime = today.atStartOfDay();
        return bookingRepository.findUpcomingBookings(fromDateTime);
    }
}
