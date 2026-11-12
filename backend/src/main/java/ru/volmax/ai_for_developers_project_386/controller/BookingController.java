package ru.volmax.ai_for_developers_project_386.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ru.volmax.ai_for_developers_project_386.data.BookingRequest;
import ru.volmax.ai_for_developers_project_386.entity.Booking;
import ru.volmax.ai_for_developers_project_386.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/")
    public ResponseEntity<?> create(@RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.create(request);
            return ResponseEntity.status(201).body(booking);
        } catch (IllegalStateException ex) {
            String message = ex.getMessage();
            if (message != null && message.contains("пересекается")) {
                return ResponseEntity.status(409).body(new BookingConflict("CONFLICT", message));
            }
            return ResponseEntity.status(400)
                    .body(new BookingConflict("VALIDATION_ERROR", message));
        }
    }

    public record BookingConflict(String code, String message) {}
}
