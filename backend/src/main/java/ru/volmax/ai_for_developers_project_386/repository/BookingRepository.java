package ru.volmax.ai_for_developers_project_386.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import ru.volmax.ai_for_developers_project_386.entity.Booking;

public interface BookingRepository extends CrudRepository<Booking, Long> {

    @Query("SELECT * FROM booking WHERE slot_start < :slotEnd AND slot_end > :slotStart")
    List<Booking> findBySlotStartBeforeAndSlotEndAfter(
            LocalDateTime slotStart, LocalDateTime slotEnd);
}
