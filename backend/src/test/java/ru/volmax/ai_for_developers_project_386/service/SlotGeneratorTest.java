package ru.volmax.ai_for_developers_project_386.service;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class SlotGeneratorTest {

    private final SlotService slotService = new SlotService(null, null);

    @Nested
    @DisplayName("generateCandidateSlots")
    class GenerateCandidateSlots {

        @Test
        @DisplayName("should return 36 slots for 15-minute intervals on weekday")
        void generateCandidateSlots15MinWeekdayShouldReturn36Slots() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 15);

            assertEquals(36, slots.size());
            assertEquals(LocalDateTime.of(date, LocalTime.of(9, 0)), slots.get(0));
            assertEquals(LocalDateTime.of(date, LocalTime.of(17, 45)), slots.get(35));
        }

        @Test
        @DisplayName("should return 18 slots for 30-minute intervals on weekday")
        void generateCandidateSlots30MinWeekdayShouldReturn18Slots() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 30);

            assertEquals(18, slots.size());
            assertEquals(LocalDateTime.of(date, LocalTime.of(9, 0)), slots.get(0));
            assertEquals(LocalDateTime.of(date, LocalTime.of(17, 30)), slots.get(17));
        }

        @Test
        @DisplayName("should return 12 slots for 45-minute intervals on weekday")
        void generateCandidateSlots45MinWeekdayShouldReturn12Slots() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 45);

            // 9 hours = 540 minutes / 45 = 12 slots
            assertEquals(12, slots.size());
            assertEquals(LocalDateTime.of(date, LocalTime.of(17, 15)), slots.get(11));
        }

        @Test
        @DisplayName("should return 9 slots for 60-minute intervals on weekday")
        void generateCandidateSlots60MinWeekdayShouldReturn9Slots() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 60);

            assertEquals(9, slots.size());
            assertEquals(LocalDateTime.of(date, LocalTime.of(17, 0)), slots.get(8));
        }

        @Test
        @DisplayName("should return empty list for Saturday")
        void generateCandidateSlotsSaturdayShouldReturnEmpty() {
            LocalDate date = LocalDate.of(2026, 11, 14); // Saturday
            List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 15);
            assertTrue(slots.isEmpty());
        }

        @Test
        @DisplayName("should return empty list for Sunday")
        void generateCandidateSlotsSundayShouldReturnEmpty() {
            LocalDate date = LocalDate.of(2026, 11, 15); // Sunday
            List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 15);
            assertTrue(slots.isEmpty());
        }

        @Test
        @DisplayName("should not exceed work end time for last slot")
        void generateCandidateSlotsLastSlotMustNotExceedWorkEnd() {
            LocalDate date = LocalDate.of(2026, 11, 16); // Monday
            List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 45);

            for (LocalDateTime slot : slots) {
                LocalDateTime slotEnd = slot.plusMinutes(45);
                assertTrue(
                        slotEnd.isBefore(LocalDateTime.of(date, LocalTime.of(18, 0)))
                                || slotEnd.equals(LocalDateTime.of(date, LocalTime.of(18, 0))));
            }
        }

        @Test
        @DisplayName("should return empty list for Friday with duration larger than working hours")
        void generateCandidateSlotsLargeDurationShouldReturnEmpty() {
            LocalDate date = LocalDate.of(2026, 11, 20); // Friday
            List<LocalDateTime> slots = slotService.generateCandidateSlots(date, 600);
            assertTrue(slots.isEmpty());
        }

        @Test
        @DisplayName("should return slots for different weekdays")
        void generateCandidateSlotsDifferentWeekdaysShouldReturnSameCount() {
            LocalDate monday = LocalDate.of(2026, 11, 16);
            LocalDate tuesday = LocalDate.of(2026, 11, 17);
            LocalDate wednesday = LocalDate.of(2026, 11, 18);
            LocalDate thursday = LocalDate.of(2026, 11, 19);
            LocalDate friday = LocalDate.of(2026, 11, 20);

            List<LocalDateTime> mondaySlots = slotService.generateCandidateSlots(monday, 30);
            List<LocalDateTime> tuesdaySlots = slotService.generateCandidateSlots(tuesday, 30);
            List<LocalDateTime> wednesdaySlots = slotService.generateCandidateSlots(wednesday, 30);
            List<LocalDateTime> thursdaySlots = slotService.generateCandidateSlots(thursday, 30);
            List<LocalDateTime> fridaySlots = slotService.generateCandidateSlots(friday, 30);

            assertEquals(mondaySlots.size(), tuesdaySlots.size());
            assertEquals(mondaySlots.size(), wednesdaySlots.size());
            assertEquals(mondaySlots.size(), thursdaySlots.size());
            assertEquals(mondaySlots.size(), fridaySlots.size());
        }
    }
}
