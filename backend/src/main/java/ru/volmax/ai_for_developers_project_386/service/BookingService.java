package ru.volmax.ai_for_developers_project_386.service;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

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
    private final Clock clock;

    public BookingService(
            BookingRepository bookingRepository,
            EventTypeRepository eventTypeRepository,
            SlotService slotService,
            Clock clock) {
        this.bookingRepository = bookingRepository;
        this.eventTypeRepository = eventTypeRepository;
        this.slotService = slotService;
        this.clock = clock;
    }

    /** Create a new booking with pessimistic locking to prevent concurrent double-booking. */
    public Booking create(BookingRequest request) {
        // A. Validate booking window: tomorrow (inclusive) to 14 days from tomorrow (inclusive)
        LocalDate today = LocalDate.ofInstant(clock.instant(), clock.getZone());
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

        // C. Validate working hours
        validateWorkingHours(slotStart, slotEnd, durationMinutes);

        // D. Pessimistic locking: lock overlapping bookings to prevent race conditions
        List<Booking> overlappingBookings =
                bookingRepository.findBySlotStartBeforeAndSlotEndForUpdate(slotStart, slotEnd);

        // E. Overlap detection (re-check against locked rows)
        for (Booking existing : overlappingBookings) {
            if (slotService.isOverlapping(
                    slotStart, slotEnd, existing.getSlotStart(), existing.getSlotEnd())) {
                throw new IllegalStateException(
                        "Выбранное время пересекается с существующим бронированием");
            }
        }

        // F. Create and save booking (with UNIQUE constraint protection)
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
                        LocalDateTime.ofInstant(clock.instant(), clock.getZone()));

        try {
            return bookingRepository.save(booking);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Слот уже занят");
        }
    }

    /**
     * Validate that slotStart and slotEnd fall within working hours (09:00–18:00, Europe/Moscow),
     * are on a working day (not weekend), and slotStart is aligned to the event duration.
     */
    private void validateWorkingHours(
            LocalDateTime slotStart, LocalDateTime slotEnd, int durationMinutes) {
        LocalDate date = slotStart.toLocalDate();
        LocalTime startTime = slotStart.toLocalTime();
        LocalTime endTime = slotEnd.toLocalTime();

        // Check working day (not weekend)
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            throw new IllegalStateException("Бронирование невозможно в выходные дни");
        }

        // Check working hours: must start at or after 09:00 and end at or before 18:00
        if (startTime.isBefore(LocalTime.of(9, 0))) {
            throw new IllegalStateException("Бронирование возможно не ранее 09:00");
        }

        if (endTime.isAfter(LocalTime.of(18, 0))) {
            throw new IllegalStateException("Бронирование должно заканчиваться не позже 18:00");
        }

        // Check slotStart alignment: must be a multiple of durationMinutes from 09:00
        long minutesFromStart =
                java.time.Duration.between(LocalTime.of(9, 0), startTime).toMinutes();
        if (minutesFromStart % durationMinutes != 0) {
            throw new IllegalStateException(
                    "Начало бронирования должно быть кратно "
                            + durationMinutes
                            + " минутам от 09:00");
        }
    }

    /** Get upcoming bookings (today and future). */
    public List<Booking> getUpcoming() {
        LocalDate today = LocalDate.ofInstant(clock.instant(), clock.getZone());
        LocalDateTime fromDateTime = today.atStartOfDay();
        return bookingRepository.findUpcomingBookings(fromDateTime);
    }
}
