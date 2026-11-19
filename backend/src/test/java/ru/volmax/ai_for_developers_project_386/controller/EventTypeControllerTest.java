package ru.volmax.ai_for_developers_project_386.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EventTypeControllerTest {

    @Autowired private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        jdbcTemplate.execute("DELETE FROM booking");
        jdbcTemplate.execute("ALTER TABLE booking ALTER COLUMN id RESTART WITH 1");
        jdbcTemplate.execute("DELETE FROM event_type");
        jdbcTemplate.execute("ALTER TABLE event_type ALTER COLUMN id RESTART WITH 1");
        jdbcTemplate.execute(
                "INSERT INTO event_type (name, description, duration_minutes) VALUES "
                        + "('Консультация', 'Краткая консультация', 15), "
                        + "('Глубокое погружение', 'Детальное обсуждение', 30)");
    }

    @Test
    void listEventTypesShouldReturnOkWithItems() throws Exception {
        mockMvc.perform(get("/api/event-types"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[0].description").exists())
                .andExpect(jsonPath("$[0].durationMinutes").exists())
                .andExpect(jsonPath("$[1].id").exists())
                .andExpect(jsonPath("$[1].name").exists())
                .andExpect(jsonPath("$[1].description").exists())
                .andExpect(jsonPath("$[1].durationMinutes").exists());
    }
}
