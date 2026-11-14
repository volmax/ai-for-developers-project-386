package ru.volmax.ai_for_developers_project_386.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

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

    @Mock private BookingRepository bookingRepository;
    @Mock private EventTypeRepository eventTypeRepository;

    @InjectMocks private SlotService slotService;

    // --- generateCandidateSlots ---

    @Test
    void generateCandidateSlots15MinWeekdayShouldReturn36Slots() {
        LocalDate date = LocalDate.of(2026, 11, 16); // Monday
        List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 15);

        assertEquals(36, slots.size());
        assertEquals(LocalDateTime.of(date, LocalTime.of(9, 0)), slots.get(0));
        assertEquals(LocalDateTime.of(date, LocalTime.of(17, 45)), slots.get(35));
    }

    @Test
    void generateCandidateSlots30MinWeekdayShouldReturn18Slots() {
        LocalDate date = LocalDate.of(2026, 11, 16); // Monday
        List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 30);

        assertEquals(18, slots.size());
        assertEquals(LocalDateTime.of(date, LocalTime.of(9, 0)), slots.get(0));
        assertEquals(LocalDateTime.of(date, LocalTime.of(17, 30)), slots.get(17));
    }

    @Test
    void generateCandidateSlotsSaturdayShouldReturnEmpty() {
        LocalDate date = LocalDate.of(2026, 11, 14); // Saturday
        List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 15);
        assertTrue(slots.isEmpty());
    }

    @Test
    void generateCandidateSlotsSundayShouldReturnEmpty() {
        LocalDate date = LocalDate.of(2026, 11, 15); // Sunday
        List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 15);
        assertTrue(slots.isEmpty());
    }

    @Test
    void generateCandidateSlotsLastSlotMustNotExceedWorkEnd() {
        // 45-min slots: 9:00, 9:45, 10:30, 11:15, 12:00, 12:45, 13:30, 14:15, 15:00, 15:45, 16:30,
        // 17:15
        // 17:15 + 45 = 18:00 (exactly work end, should be included)
        LocalDate date = LocalDate.of(2026, 11, 16); // Monday
        List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 45);

        // 9 hours = 540 minutes / 45 = 12 slots
        assertEquals(12, slots.size());
        assertEquals(LocalDateTime.of(date, LocalTime.of(17, 15)), slots.get(11));
    }

    @Test
    void generateCandidateSlots60MinWeekdayShouldReturn9Slots() {
        LocalDate date = LocalDate.of(2026, 11, 16); // Monday
        List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 60);

        // 9 hours / 1 hour = 9 slots
        assertEquals(9, slots.size());
        assertEquals(LocalDateTime.of(date, LocalTime.of(17, 0)), slots.get(8));
    }

    // --- isOverlapping ---

    @Test
    void isOverlappingShouldReturnTrueForFullOverlap() {
        LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
        LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 11, 0);
        LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 10, 30);
        LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 11, 30);

        assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
    }

    @Test
    void isOverlappingShouldReturnTrueForPartialOverlap() {
        LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
        LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 10, 30);
        LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 10, 15);
        LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 10, 45);

        assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
    }

    @Test
    void isOverlappingShouldReturnFalseForTouchingBoundaries() {
        LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
        LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 11, 0);
        LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 11, 0);
        LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 12, 0);

        assertFalse(slotService.isOverlapping(start1, end1, start2, end2));
    }

    @Test
    void isOverlappingShouldReturnFalseForGap() {
        LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
        LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 10, 30);
        LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 11, 0);
        LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 11, 30);

        assertFalse(slotService.isOverlapping(start1, end1, start2, end2));
    }

    @Test
    void isOverlappingShouldReturnTrueForContained() {
        LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 9, 0);
        LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 18, 0);
        LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 10, 0);
        LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 11, 0);

        assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
    }

    // --- calculateAvailableSlots ---

    @Test
    void calculateAvailableSlotsWithNoBookingsShouldReturnAllCandidateSlots() {
        LocalDate date = LocalDate.of(2026, 11, 16); // Monday
        String eventTypeId = "1";

        EventType eventType = new EventType(1L, "Консультация", "30 min", 30);
        when(eventTypeRepository.findById(1L)).thenReturn(java.util.Optional.of(eventType));
        when(bookingRepository.findBookingsForDay(any(), any())).thenReturn(List.of());

        List<String> slots = slotService.calculateAvailableSlots(eventTypeId, date);

        assertEquals(18, slots.size());
        // First slot should be 09:00
        assertTrue(slots.get(0).startsWith("2026-11-16T09:00"));
    }

    @Test
    void calculateAvailableSlotsWithBookingsShouldFilterOverlapping() {
        LocalDate date = LocalDate.of(2026, 11, 16); // Monday
        String eventTypeId = "1";

        EventType eventType = new EventType(1L, "Консультация", "30 min", 30);
        when(eventTypeRepository.findById(1L)).thenReturn(java.util.Optional.of(eventType));

        // One booking at 10:00-10:30
        Booking existingBooking =
                new Booking(
                        1L,
                        "1",
                        "Консультация",
                        30,
                        LocalDateTime.of(date, LocalTime.of(10, 0)),
                        LocalDateTime.of(date, LocalTime.of(10, 30)),
                        "Guest",
                        "guest@example.com",
                        LocalDateTime.now(ZoneId.of("Europe/Moscow")));
        when(bookingRepository.findBookingsForDay(any(), any()))
                .thenReturn(List.of(existingBooking));

        List<String> slots = slotService.calculateAvailableSlots(eventTypeId, date);

        // 18 total - 1 overlapping = 17
        assertEquals(17, slots.size());

        // Verify the 10:00 slot is NOT in the list
        for (String slot : slots) {
            assertFalse(slot.startsWith("2026-11-16T10:00"));
        }
    }

    @Test
    void calculateAvailableSlotsForNonExistentEventTypeShouldReturnEmpty() {
        LocalDate date = LocalDate.of(2026, 11, 16);
        when(eventTypeRepository.findById(999L)).thenReturn(java.util.Optional.empty());

        List<String> slots = slotService.calculateAvailableSlots("999", date);

        assertTrue(slots.isEmpty());
    }

    // --- countFreeSlots ---

    @Test
    void countFreeSlotsShouldReturnSameAsCalculateAvailableSlotsSize() {
        LocalDate date = LocalDate.of(2026, 11, 16); // Monday
        String eventTypeId = "1";

        EventType eventType = new EventType(1L, "Консультация", "30 min", 30);
        when(eventTypeRepository.findById(1L)).thenReturn(java.util.Optional.of(eventType));
        when(bookingRepository.findBookingsForDay(any(), any())).thenReturn(List.of());

        int count = slotService.countFreeSlots(eventTypeId, date);
        List<String> slots = slotService.calculateAvailableSlots(eventTypeId, date);

        assertEquals(slots.size(), count);
    }
}
