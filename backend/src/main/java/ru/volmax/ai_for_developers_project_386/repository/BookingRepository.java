package ru.volmax.ai_for_developers_project_386.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import ru.volmax.ai_for_developers_project_386.entity.Booking;

public interface BookingRepository extends CrudRepository<Booking, Long> {

    @Query(
            "SELECT * FROM booking "
                    + "WHERE slot_start < :slotEnd AND slot_end > :slotStart "
                    + "FOR UPDATE")
    List<Booking> findBySlotStartBeforeAndSlotEndForUpdate(
            @Param("slotStart") LocalDateTime slotStart, @Param("slotEnd") LocalDateTime slotEnd);

    @Query("SELECT * FROM booking " + "WHERE slot_start < :slotEnd AND slot_end > :slotStart")
    List<Booking> findBySlotStartBeforeAndSlotEndAfter(
            @Param("slotStart") LocalDateTime slotStart, @Param("slotEnd") LocalDateTime slotEnd);

    @Query(
            "SELECT * FROM booking "
                    + "WHERE slot_start >= :fromDateTime "
                    + "ORDER BY slot_start ASC")
    List<Booking> findUpcomingBookings(@Param("fromDateTime") LocalDateTime fromDateTime);

    @Query("SELECT * FROM booking " + "WHERE slot_start >= :dayStart AND slot_start < :dayEnd")
    List<Booking> findBookingsForDay(
            @Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd);
}
