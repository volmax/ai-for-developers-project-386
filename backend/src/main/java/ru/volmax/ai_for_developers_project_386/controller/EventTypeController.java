package ru.volmax.ai_for_developers_project_386.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ru.volmax.ai_for_developers_project_386.dto.EventTypeCreateRequest;
import ru.volmax.ai_for_developers_project_386.entity.EventType;
import ru.volmax.ai_for_developers_project_386.service.EventTypeService;

@RestController
@RequestMapping("/api/event-types")
public class EventTypeController {

    private final EventTypeService eventTypeService;

    public EventTypeController(EventTypeService eventTypeService) {
        this.eventTypeService = eventTypeService;
    }

    @GetMapping
    public ResponseEntity<List<EventType>> list() {
        return ResponseEntity.ok(eventTypeService.findAll());
    }

    @PostMapping
    public ResponseEntity<EventType> create(@RequestBody EventTypeCreateRequest request) {
        EventType eventType = eventTypeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventType);
    }
}
