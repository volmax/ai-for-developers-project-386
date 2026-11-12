package ru.volmax.ai_for_developers_project_386.service;

import java.util.List;

import org.springframework.stereotype.Service;

import ru.volmax.ai_for_developers_project_386.entity.EventType;
import ru.volmax.ai_for_developers_project_386.repository.EventTypeRepository;

@Service
public class EventTypeService {

    private final EventTypeRepository eventTypeRepository;

    public EventTypeService(EventTypeRepository eventTypeRepository) {
        this.eventTypeRepository = eventTypeRepository;
    }

    public List<EventType> findAll() {
        return eventTypeRepository.findAll();
    }
}
