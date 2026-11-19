package ru.volmax.ai_for_developers_project_386.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ru.volmax.ai_for_developers_project_386.dto.EventTypeCreateRequest;
import ru.volmax.ai_for_developers_project_386.entity.EventType;
import ru.volmax.ai_for_developers_project_386.repository.EventTypeRepository;

@Service
public class EventTypeService {

    private static final int MIN_DURATION = 15;
    private static final int WORKING_DAY_MINUTES = 540; // 09:00–18:00 = 9 часов

    private final EventTypeRepository eventTypeRepository;

    public EventTypeService(EventTypeRepository eventTypeRepository) {
        this.eventTypeRepository = eventTypeRepository;
    }

    public List<EventType> findAll() {
        return eventTypeRepository.findAll();
    }

    public EventType create(EventTypeCreateRequest request) {
        validate(request);
        checkUniqueName(request.getName());
        checkUniqueDuration(request.getDurationMinutes());

        EventType eventType =
                new EventType(
                        null,
                        request.getName(),
                        request.getDescription(),
                        request.getDurationMinutes());
        return eventTypeRepository.save(eventType);
    }

    private void validate(EventTypeCreateRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Название не может быть пустым");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Описание не может быть пустым");
        }
        if (request.getDurationMinutes() < MIN_DURATION) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Длительность должна быть не менее " + MIN_DURATION + " минут");
        }
        if (request.getDurationMinutes() > WORKING_DAY_MINUTES) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Длительность не может превышать "
                            + WORKING_DAY_MINUTES
                            + " минут (рабочий день)");
        }
        if (request.getDurationMinutes() % MIN_DURATION != 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Длительность должна быть кратна " + MIN_DURATION + " минутам");
        }
    }

    private void checkUniqueName(String name) {
        eventTypeRepository
                .findByNameIgnoreCase(name)
                .ifPresent(
                        existing -> {
                            throw new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Тип события с названием \""
                                            + existing.getName()
                                            + "\" уже существует");
                        });
    }

    private void checkUniqueDuration(int durationMinutes) {
        eventTypeRepository
                .findByDurationMinutes(durationMinutes)
                .ifPresent(
                        existing -> {
                            throw new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Тип события на " + durationMinutes + " минут уже существует");
                        });
    }
}
