package ru.volmax.ai_for_developers_project_386.controller;

import javax.sql.DataSource;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@ConditionalOnProperty(name = "admin.reset.enabled", havingValue = "true")
public class AdminResetController {

    private final JdbcTemplate jdbcTemplate;

    public AdminResetController(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @PostMapping("/reset")
    @Transactional
    public ResponseEntity<Void> reset() {
        // booking → event_type (FK order)
        jdbcTemplate.execute("DELETE FROM booking");
        jdbcTemplate.execute("ALTER TABLE booking ALTER COLUMN id RESTART WITH 1");
        jdbcTemplate.execute("DELETE FROM event_type");
        jdbcTemplate.execute("ALTER TABLE event_type ALTER COLUMN id RESTART WITH 1");

        // Re-seed event types
        jdbcTemplate.execute(
                "INSERT INTO event_type (name, description, duration_minutes) VALUES "
                        + "('Консультация', 'Краткая консультация', 15), "
                        + "('Глубокое погружение', 'Детальное обсуждение', 30)");

        return ResponseEntity.ok().build();
    }
}
