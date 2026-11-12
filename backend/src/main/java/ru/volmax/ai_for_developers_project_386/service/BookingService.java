package ru.volmax.ai_for_developers_project_386.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    public BookingService(
            BookingRepository bookingRepository, EventTypeRepository eventTypeRepository) {
        this.bookingRepository = bookingRepository;
        this.eventTypeRepository = eventTypeRepository;
    }

    public Booking create(BookingRequest request) {
        // A. Validate booking window: tomorrow (inclusive) to 14 days from tomorrow (inclusive)
        LocalDate today = LocalDate.now();
        LocalDate windowStart = today.plusDays(1);
        LocalDate windowEnd = today.plusDays(15).minusDays(1); // 14 days from tomorrow = today + 15

        LocalDate requestedDate = request.getSlotStart().toLocalDate();

        if (requestedDate.isBefore(windowStart) || requestedDate.isAfter(windowEnd)) {
            throw new IllegalStateException(
                    "Бронирование возможно только с "
                            + windowStart
                            + " по "
                            + windowEnd
                            + " включительно");
        }

        // B. Overlap detection
        LocalDateTime slotStart = request.getSlotStart();
        // Calculate slotEnd later after we know the duration, but for overlap check we need a
        // provisional end.
        // First, look up the event type to get duration.
        Optional<EventType> eventTypeOpt =
                eventTypeRepository.findById(Long.parseLong(request.getEventTypeId()));
        if (eventTypeOpt.isEmpty()) {
            throw new IllegalStateException("Тип события не найден: " + request.getEventTypeId());
        }

        EventType eventType = eventTypeOpt.get();
        int durationMinutes = eventType.getDurationMinutes();
        LocalDateTime slotEnd = slotStart.plusMinutes(durationMinutes);

        // Check for overlapping bookings
        List<Booking> overlappingBookings =
                bookingRepository.findBySlotStartBeforeAndSlotEndAfter(slotStart, slotEnd);

        if (!overlappingBookings.isEmpty()) {
            throw new IllegalStateException(
                    "Выбранное время пересекается с существующим бронированием");
        }

        // C. Create and save booking
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
                        LocalDateTime.now());

        return bookingRepository.save(booking);
    }
}
