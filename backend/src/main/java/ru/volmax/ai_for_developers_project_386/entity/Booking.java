package ru.volmax.ai_for_developers_project_386.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("booking")
public class Booking {

    @Id
    @Column("id")
    private Long id;

    @Column("event_type_id")
    private String eventTypeId;

    @Column("event_type_name")
    private String eventTypeName;

    @Column("event_duration_minutes")
    private int eventDurationMinutes;

    @Column("slot_start")
    private LocalDateTime slotStart;

    @Column("slot_end")
    private LocalDateTime slotEnd;

    @Column("guest_name")
    private String guestName;

    @Column("guest_email")
    private String guestEmail;

    @Column("created_at")
    private LocalDateTime createdAt;

    public Booking(
            Long id,
            String eventTypeId,
            String eventTypeName,
            int eventDurationMinutes,
            LocalDateTime slotStart,
            LocalDateTime slotEnd,
            String guestName,
            String guestEmail,
            LocalDateTime createdAt) {
        this.id = id;
        this.eventTypeId = eventTypeId;
        this.eventTypeName = eventTypeName;
        this.eventDurationMinutes = eventDurationMinutes;
        this.slotStart = slotStart;
        this.slotEnd = slotEnd;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getEventTypeId() {
        return eventTypeId;
    }

    public String getEventTypeName() {
        return eventTypeName;
    }

    public int getEventDurationMinutes() {
        return eventDurationMinutes;
    }

    public LocalDateTime getSlotStart() {
        return slotStart;
    }

    public LocalDateTime getSlotEnd() {
        return slotEnd;
    }

    public String getGuestName() {
        return guestName;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
