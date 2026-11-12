package ru.volmax.ai_for_developers_project_386.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import ru.volmax.ai_for_developers_project_386.entity.EventType;

public interface EventTypeRepository extends CrudRepository<EventType, Long> {

    @Query("SELECT * FROM event_type")
    List<EventType> findAll();
}
