package ru.volmax.ai_for_developers_project_386.dto;

/** Запрос на создание нового типа события. */
public class EventTypeCreateRequest {

    private String name;
    private String description;
    private int durationMinutes;

    public EventTypeCreateRequest() {}

    public EventTypeCreateRequest(String name, String description, int durationMinutes) {
        this.name = name;
        this.description = description;
        this.durationMinutes = durationMinutes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}
