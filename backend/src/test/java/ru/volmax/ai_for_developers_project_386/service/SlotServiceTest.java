package ru.volmax.ai_for_developers_project_386.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ru.volmax.ai_for_developers_project_386.entity.Booking;
import ru.volmax.ai_for_developers_project_386.entity.EventType;
import ru.volmax.ai_for_developers_project_386.repository.BookingRepository;
import ru.volmax.ai_for_developers_project_386.repository.EventTypeRepository;

@ExtendWith(MockitoExtension.class)
class SlotServiceTest {

    private static final ZoneId TEST_TIMEZONE = ZoneId.of("Europe/Moscow");

    @Mock private BookingRepository bookingRepository;
    @Mock private EventTypeRepository eventTypeRepository;

    @InjectMocks private SlotService slotService;

    private EventType eventType;

    @BeforeEach
    void setUp() {
        eventType = new EventType(1L, "Консультация", "30 min", 30);
    }

    @Nested
    @DisplayName("calculateAvailableSlots")
    class CalculateAvailableSlots {

        @Test
        @DisplayName("should return all candidate slots when there are no bookings")
        void calculateAvailableSlotsWithNoBookingsShouldReturnAllCandidateSlots() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            String eventTypeId = "1";

            when(eventTypeRepository.findById(anyLong()))
                    .thenReturn(java.util.Optional.of(eventType));
            when(bookingRepository.findBookingsForDay(any(), any())).thenReturn(List.of());

            List<String> slots = slotService.calculateAvailableSlots(eventTypeId, date);

            assertEquals(18, slots.size());
            assertEquals("2026-11-16T09:00", slots.get(0));
            assertEquals("2026-11-16T17:30", slots.get(17));

            verify(eventTypeRepository).findById(1L);
            verify(bookingRepository).findBookingsForDay(any(), any());
            verifyNoMoreInteractions(eventTypeRepository, bookingRepository);
        }

        @Test
        @DisplayName("should filter slots that overlap with existing bookings")
        void calculateAvailableSlotsWithBookingsShouldFilterOverlapping() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            String eventTypeId = "1";

            Booking existingBooking =
                    Booking.testEntity()
                            .id(1L)
                            .eventTypeId("1")
                            .eventTypeName("Консультация")
                            .eventDurationMinutes(30)
                            .slotStart(LocalDateTime.of(date, LocalTime.of(10, 0)))
                            .slotEnd(LocalDateTime.of(date, LocalTime.of(10, 30)))
                            .guestName("Guest")
                            .guestEmail("guest@example.com")
                            .createdAt(LocalDateTime.now(TEST_TIMEZONE))
                            .build();

            when(eventTypeRepository.findById(anyLong()))
                    .thenReturn(java.util.Optional.of(eventType));
            when(bookingRepository.findBookingsForDay(any(), any()))
                    .thenReturn(List.of(existingBooking));

            List<String> slots = slotService.calculateAvailableSlots(eventTypeId, date);

            assertEquals(17, slots.size());

            for (String slot : slots) {
                assertFalse(slot.startsWith("2026-11-16T10:00"));
            }

            verify(eventTypeRepository).findById(1L);
            verify(bookingRepository).findBookingsForDay(any(), any());
            verifyNoMoreInteractions(eventTypeRepository, bookingRepository);
        }

        @Test
        @DisplayName("should return empty list for non-existent event type")
        void calculateAvailableSlotsForNonExistentEventTypeShouldReturnEmpty() {
            LocalDate date = LocalDate.of(2026, 11, 16);

            when(eventTypeRepository.findById(999L)).thenReturn(java.util.Optional.empty());

            List<String> slots = slotService.calculateAvailableSlots("999", date);

            assertTrue(slots.isEmpty());

            verify(eventTypeRepository).findById(999L);
            verifyNoMoreInteractions(eventTypeRepository, bookingRepository);
        }

        @Test
        @DisplayName("should filter multiple overlapping bookings")
        void calculateAvailableSlotsShouldFilterMultipleOverlappingBookings() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            String eventTypeId = "1";

            Booking booking1 =
                    Booking.testEntity()
                            .id(1L)
                            .eventTypeId("1")
                            .eventTypeName("Консультация")
                            .eventDurationMinutes(30)
                            .slotStart(LocalDateTime.of(date, LocalTime.of(9, 0)))
                            .slotEnd(LocalDateTime.of(date, LocalTime.of(9, 30)))
                            .guestName("Guest1")
                            .guestEmail("guest1@example.com")
                            .createdAt(LocalDateTime.now(TEST_TIMEZONE))
                            .build();

            Booking booking2 =
                    Booking.testEntity()
                            .id(2L)
                            .eventTypeId("1")
                            .eventTypeName("Консультация")
                            .eventDurationMinutes(30)
                            .slotStart(LocalDateTime.of(date, LocalTime.of(14, 0)))
                            .slotEnd(LocalDateTime.of(date, LocalTime.of(14, 30)))
                            .guestName("Guest2")
                            .guestEmail("guest2@example.com")
                            .createdAt(LocalDateTime.now(TEST_TIMEZONE))
                            .build();

            when(eventTypeRepository.findById(anyLong()))
                    .thenReturn(java.util.Optional.of(eventType));
            when(bookingRepository.findBookingsForDay(any(), any()))
                    .thenReturn(List.of(booking1, booking2));

            List<String> slots = slotService.calculateAvailableSlots(eventTypeId, date);

            assertEquals(16, slots.size());

            for (String slot : slots) {
                assertFalse(slot.startsWith("2026-11-16T09:00"));
                assertFalse(slot.startsWith("2026-11-16T14:00"));
            }

            verify(eventTypeRepository).findById(1L);
            verify(bookingRepository).findBookingsForDay(any(), any());
            verifyNoMoreInteractions(eventTypeRepository, bookingRepository);
        }
    }

    @Nested
    @DisplayName("countFreeSlots")
    class CountFreeSlots {

        @Test
        @DisplayName("should return the same count as calculateAvailableSlots size")
        void countFreeSlotsShouldReturnSameAsCalculateAvailableSlotsSize() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            String eventTypeId = "1";

            when(eventTypeRepository.findById(anyLong()))
                    .thenReturn(java.util.Optional.of(eventType));
            when(bookingRepository.findBookingsForDay(any(), any())).thenReturn(List.of());

            int count = slotService.countFreeSlots(eventTypeId, date);
            List<String> slots = slotService.calculateAvailableSlots(eventTypeId, date);

            assertEquals(slots.size(), count);

            verify(eventTypeRepository, times(2)).findById(1L);
            verify(bookingRepository, times(2)).findBookingsForDay(any(), any());
            verifyNoMoreInteractions(eventTypeRepository, bookingRepository);
        }

        @Test
        @DisplayName("should return 0 for non-existent event type")
        void countFreeSlotsForNonExistentEventTypeShouldReturnZero() {
            LocalDate date = LocalDate.of(2026, 11, 16);

            when(eventTypeRepository.findById(999L)).thenReturn(java.util.Optional.empty());

            int count = slotService.countFreeSlots("999", date);

            assertEquals(0, count);

            verify(eventTypeRepository).findById(999L);
            verifyNoMoreInteractions(eventTypeRepository, bookingRepository);
        }
    }
}
