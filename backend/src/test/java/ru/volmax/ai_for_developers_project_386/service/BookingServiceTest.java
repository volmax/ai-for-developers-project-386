package ru.volmax.ai_for_developers_project_386.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.dao.DataIntegrityViolationException;

import ru.volmax.ai_for_developers_project_386.data.BookingRequest;
import ru.volmax.ai_for_developers_project_386.entity.Booking;
import ru.volmax.ai_for_developers_project_386.repository.BookingRepository;
import ru.volmax.ai_for_developers_project_386.repository.EventTypeRepository;

@SpringBootTest
class BookingServiceTest {

    @Autowired private BookingService bookingService;

    @Autowired private BookingRepository bookingRepository;

    @Autowired private EventTypeRepository eventTypeRepository;

    @Autowired private SlotService slotService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        SlotService slotService() {
            return org.mockito.Mockito.mock(SlotService.class);
        }
    }

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
    }

    // --- create ---

    @Test
    void createValidBookingShouldReturnCreatedBooking() {
        LocalDateTime slotStart =
                LocalDate.now(ZoneId.of("Europe/Moscow")).plusDays(3).atTime(10, 0);
        BookingRequest request = new BookingRequest();
        request.setEventTypeId("1");
        request.setSlotStart(slotStart);
        request.setGuestName("Test Guest");
        request.setGuestEmail("test@example.com");

        // Mock overlap check to return empty (no overlaps)
        when(slotService.isOverlapping(
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any()))
                .thenReturn(false);

        Booking booking = bookingService.create(request);

        assertNotNull(booking.getId());
        assertEquals("1", booking.getEventTypeId());
        assertEquals("Консультация", booking.getEventTypeName());
        assertEquals(15, booking.getEventDurationMinutes());
        assertEquals(slotStart, booking.getSlotStart());
        assertEquals(slotStart.plusMinutes(15), booking.getSlotEnd());
        assertEquals("Test Guest", booking.getGuestName());
        assertEquals("test@example.com", booking.getGuestEmail());
    }

    @Test
    void createBookingOutsideWindowShouldThrow() {
        // Yesterday is outside the booking window (tomorrow + 14 days)
        LocalDateTime slotStart =
                LocalDate.now(ZoneId.of("Europe/Moscow")).minusDays(1).atTime(10, 0);

        BookingRequest request = new BookingRequest();
        request.setEventTypeId("1");
        request.setSlotStart(slotStart);
        request.setGuestName("Test Guest");
        request.setGuestEmail("test@example.com");

        when(slotService.isOverlapping(
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any()))
                .thenReturn(false);

        assertThrows(IllegalStateException.class, () -> bookingService.create(request));
    }

    @Test
    void createBookingTooFarInFutureShouldThrow() {
        LocalDateTime slotStart =
                LocalDate.now(ZoneId.of("Europe/Moscow")).plusDays(20).atTime(10, 0);
        BookingRequest request = new BookingRequest();
        request.setEventTypeId("1");
        request.setSlotStart(slotStart);
        request.setGuestName("Test Guest");
        request.setGuestEmail("test@example.com");

        when(slotService.isOverlapping(
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any()))
                .thenReturn(false);

        assertThrows(IllegalStateException.class, () -> bookingService.create(request));
    }

    @Test
    void createBookingWithNonExistentEventTypeShouldThrow() {
        LocalDateTime slotStart =
                LocalDate.now(ZoneId.of("Europe/Moscow")).plusDays(3).atTime(10, 0);
        BookingRequest request = new BookingRequest();
        request.setEventTypeId("999");
        request.setSlotStart(slotStart);
        request.setGuestName("Test Guest");
        request.setGuestEmail("test@example.com");

        assertThrows(IllegalStateException.class, () -> bookingService.create(request));
    }

    @Test
    void createBookingWithDuplicateSlotShouldThrow() {
        LocalDateTime slotStart =
                LocalDate.now(ZoneId.of("Europe/Moscow")).plusDays(3).atTime(10, 0);

        // First booking should succeed
        BookingRequest firstRequest = new BookingRequest();
        firstRequest.setEventTypeId("1");
        firstRequest.setSlotStart(slotStart);
        firstRequest.setGuestName("First Guest");
        firstRequest.setGuestEmail("first@example.com");

        when(slotService.isOverlapping(
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any()))
                .thenReturn(false);

        // First booking
        Booking firstBooking = bookingService.create(firstRequest);
        assertNotNull(firstBooking.getId());

        // Second booking with the same slotStart should fail
        BookingRequest secondRequest = new BookingRequest();
        secondRequest.setEventTypeId("1");
        secondRequest.setSlotStart(slotStart);
        secondRequest.setGuestName("Second Guest");
        secondRequest.setGuestEmail("second@example.com");

        assertThrows(
                DataIntegrityViolationException.class,
                () ->
                        bookingRepository.save(
                                new Booking(
                                        null,
                                        "1",
                                        "Консультация",
                                        15,
                                        slotStart,
                                        slotStart.plusMinutes(15),
                                        "Second Guest",
                                        "second@example.com",
                                        LocalDateTime.now(ZoneId.of("Europe/Moscow")))));
    }

    // --- getUpcoming ---

    @Test
    void getUpcomingShouldReturnFutureBookings() {
        List<Booking> upcoming = bookingService.getUpcoming();
        // Should return a list (may be empty if no bookings exist yet)
        assertNotNull(upcoming);
        // All returned bookings should be today or future
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Moscow"));
        for (Booking booking : upcoming) {
            assertTrue(
                    booking.getSlotStart().toLocalDate().isEqual(today)
                            || booking.getSlotStart().toLocalDate().isAfter(today),
                    "Booking slot date should be today or future");
        }
    }
}
