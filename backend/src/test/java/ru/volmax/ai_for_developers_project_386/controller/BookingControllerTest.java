package ru.volmax.ai_for_developers_project_386.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingControllerTest {

    @Autowired private MockMvc mockMvc;

    @Test
    void createBookingShouldReturn201() throws Exception {
        LocalDateTime slotStart = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        String json =
                """
                {
                    "eventTypeId": "1",
                    "slotStart": "%s",
                    "guestName": "Test Guest",
                    "guestEmail": "test@example.com"
                }
                """
                        .formatted(slotStart.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        mockMvc.perform(
                        post("/api/bookings/")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventTypeId").value("1"))
                .andExpect(jsonPath("$.eventTypeName").value("Консультация"))
                .andExpect(jsonPath("$.guestName").value("Test Guest"))
                .andExpect(jsonPath("$.guestEmail").value("test@example.com"))
                .andExpect(jsonPath("$.slotStart").exists())
                .andExpect(jsonPath("$.slotEnd").exists())
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void createOverlappingBookingShouldReturn409() throws Exception {
        LocalDateTime slotStart = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        String json1 =
                """
                {
                    "eventTypeId": "1",
                    "slotStart": "%s",
                    "guestName": "First Guest",
                    "guestEmail": "first@example.com"
                }
                """
                        .formatted(slotStart.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        mockMvc.perform(
                        post("/api/bookings/")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json1))
                .andExpect(status().isCreated());

        String json2 =
                """
                {
                    "eventTypeId": "1",
                    "slotStart": "%s",
                    "guestName": "Second Guest",
                    "guestEmail": "second@example.com"
                }
                """
                        .formatted(slotStart.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        mockMvc.perform(
                        post("/api/bookings/")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json2))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void upcomingShouldReturn200WithBookings() throws Exception {
        mockMvc.perform(get("/api/bookings/upcoming"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void availableSlotsShouldReturn200WithSlots() throws Exception {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        mockMvc.perform(
                        get("/api/bookings/available-slots")
                                .param("eventTypeId", "1")
                                .param("date", tomorrow.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void freeSlotsCountShouldReturn200WithCount() throws Exception {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        mockMvc.perform(
                        get("/api/bookings/free-slots-count")
                                .param("eventTypeId", "1")
                                .param("date", tomorrow.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
