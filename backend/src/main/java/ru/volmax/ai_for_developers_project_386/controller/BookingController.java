package ru.volmax.ai_for_developers_project_386.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import ru.volmax.ai_for_developers_project_386.data.BookingRequest;
import ru.volmax.ai_for_developers_project_386.entity.Booking;
import ru.volmax.ai_for_developers_project_386.service.BookingService;
import ru.volmax.ai_for_developers_project_386.service.SlotService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final SlotService slotService;

    public BookingController(BookingService bookingService, SlotService slotService) {
        this.bookingService = bookingService;
        this.slotService = slotService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.create(request);
            return ResponseEntity.status(201).body(new BookingCreated(booking));
        } catch (IllegalStateException ex) {
            String message = ex.getMessage();
            if (message != null && message.contains("пересекается")) {
                return ResponseEntity.status(409).body(new BookingConflict("CONFLICT", message));
            }
            return ResponseEntity.status(400)
                    .body(new BookingConflict("VALIDATION_ERROR", message));
        }
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Booking>> upcoming() {
        return ResponseEntity.ok(bookingService.getUpcoming());
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<String>> availableSlots(
            @RequestParam String eventTypeId, @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        List<String> slots = slotService.calculateAvailableSlots(eventTypeId, localDate);
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/free-slots-count")
    public ResponseEntity<Integer> freeSlotsCount(
            @RequestParam String eventTypeId, @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        int count = slotService.countFreeSlots(eventTypeId, localDate);
        return ResponseEntity.ok(count);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BookingConflict> handleValidation(MethodArgumentNotValidException ex) {
        String message =
                ex.getBindingResult().getFieldErrors().stream()
                        .map(e -> e.getField() + ": " + e.getDefaultMessage())
                        .reduce((a, b) -> a + "; " + b)
                        .orElse("Validation failed");
        return ResponseEntity.status(400).body(new BookingConflict("VALIDATION_ERROR", message));
    }

    public record BookingConflict(String code, String message) {}

    public record BookingCreated(Booking booking) {}
}
