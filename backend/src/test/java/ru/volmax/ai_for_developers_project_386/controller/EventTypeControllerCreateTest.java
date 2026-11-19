package ru.volmax.ai_for_developers_project_386.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EventTypeControllerCreateTest {

    @Autowired private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void createEventTypeShouldReturn201WithCreatedEvent() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Менторство",
                                "description", "Персональное менторство",
                                "durationMinutes", 60));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Менторство"))
                .andExpect(jsonPath("$.description").value("Персональное менторство"))
                .andExpect(jsonPath("$.durationMinutes").value(60));
    }

    @Test
    void createEventTypeWithEmptyNameShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "",
                                "description", "Описание",
                                "durationMinutes", 30));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeWithBlankNameShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "   ",
                                "description", "Описание",
                                "durationMinutes", 30));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeWithEmptyDescriptionShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Тест",
                                "description", "",
                                "durationMinutes", 30));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeWithDurationTooSmallShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Тест",
                                "description", "Описание",
                                "durationMinutes", 10));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeWithDurationTooLargeShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Тест",
                                "description", "Описание",
                                "durationMinutes", 600));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeWithDurationNotMultipleOf15ShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Тест",
                                "description", "Описание",
                                "durationMinutes", 20));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeWithDuplicateNameShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Консультация",
                                "description", "Новое описание",
                                "durationMinutes", 45));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeWithDuplicateDurationShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Новый тип",
                                "description", "Описание",
                                "durationMinutes", 15));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeCaseInsensitiveNameDuplicateShouldReturn400() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "консультация",
                                "description", "Описание",
                                "durationMinutes", 45));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createEventTypeWithMaxDurationShouldReturn201() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Полный день",
                                "description", "Весь рабочий день",
                                "durationMinutes", 540));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.durationMinutes").value(540));
    }

    @Test
    void duplicateDurationShouldReturn400WithHumanReadableMessage() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Новый тип",
                                "description", "Описание",
                                "durationMinutes", 15));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.message").value("Тип события на 15 минут уже существует"));
    }

    @Test
    void duplicateNameShouldReturn400WithHumanReadableMessage() throws Exception {
        String json =
                objectMapper.writeValueAsString(
                        Map.of(
                                "name", "Консультация",
                                "description", "Новое описание",
                                "durationMinutes", 45));

        mockMvc.perform(
                        post("/api/event-types")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(
                        jsonPath("$.message")
                                .value("Тип события с названием \"Консультация\" уже существует"));
    }
}
