package ru.volmax.ai_for_developers_project_386.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import ru.volmax.ai_for_developers_project_386.entity.EventType;

public interface EventTypeRepository extends CrudRepository<EventType, Long> {

    @Query("SELECT * FROM event_type")
    List<EventType> findAll();

    @Query("SELECT * FROM event_type WHERE lower(name) = lower(:name) LIMIT 1")
    Optional<EventType> findByNameIgnoreCase(String name);

    @Query("SELECT * FROM event_type WHERE duration_minutes = :durationMinutes LIMIT 1")
    Optional<EventType> findByDurationMinutes(int durationMinutes);
}
