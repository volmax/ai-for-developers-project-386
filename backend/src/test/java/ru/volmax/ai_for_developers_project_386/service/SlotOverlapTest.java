package ru.volmax.ai_for_developers_project_386.service;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class SlotOverlapTest {

    private final SlotService slotService = new SlotService(null, null);

    @Nested
    @DisplayName("isOverlapping")
    class IsOverlapping {

        @Test
        @DisplayName("should return true for full overlap")
        void isOverlappingShouldReturnTrueForFullOverlap() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 11, 0);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 10, 30);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 11, 30);

            assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
        }

        @Test
        @DisplayName("should return true for partial overlap")
        void isOverlappingShouldReturnTrueForPartialOverlap() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 10, 30);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 10, 15);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 10, 45);

            assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
        }

        @Test
        @DisplayName("should return false for touching boundaries")
        void isOverlappingShouldReturnFalseForTouchingBoundaries() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 11, 0);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 11, 0);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 12, 0);

            assertFalse(slotService.isOverlapping(start1, end1, start2, end2));
        }

        @Test
        @DisplayName("should return false for gap between intervals")
        void isOverlappingShouldReturnFalseForGap() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 10, 30);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 11, 0);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 11, 30);

            assertFalse(slotService.isOverlapping(start1, end1, start2, end2));
        }

        @Test
        @DisplayName("should return true for contained interval")
        void isOverlappingShouldReturnTrueForContained() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 9, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 18, 0);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 11, 0);

            assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
        }

        @Test
        @DisplayName("should return true when first interval is contained in second")
        void isOverlappingShouldReturnTrueWhenFirstContainedInSecond() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 11, 0);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 9, 0);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 18, 0);

            assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
        }

        @Test
        @DisplayName("should return false for identical intervals")
        void isOverlappingShouldReturnTrueForIdenticalIntervals() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 11, 0);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 11, 0);

            assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
        }

        @Test
        @DisplayName("should return true when intervals overlap at the start")
        void isOverlappingShouldReturnTrueWhenOverlapAtStart() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 12, 0);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 9, 0);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 10, 30);

            assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
        }

        @Test
        @DisplayName("should return true when intervals overlap at the end")
        void isOverlappingShouldReturnTrueWhenOverlapAtEnd() {
            LocalDateTime start1 = LocalDateTime.of(2026, 11, 16, 9, 0);
            LocalDateTime end1 = LocalDateTime.of(2026, 11, 16, 10, 30);
            LocalDateTime start2 = LocalDateTime.of(2026, 11, 16, 10, 0);
            LocalDateTime end2 = LocalDateTime.of(2026, 11, 16, 12, 0);

            assertTrue(slotService.isOverlapping(start1, end1, start2, end2));
        }
    }
}
