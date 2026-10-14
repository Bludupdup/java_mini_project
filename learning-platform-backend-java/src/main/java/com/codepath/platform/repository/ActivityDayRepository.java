package com.codepath.platform.repository;

import com.codepath.platform.entity.ActivityDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ActivityDayRepository extends JpaRepository<ActivityDay, Long> {

    List<ActivityDay> findByUserIdOrderByDayAsc(Long userId);

    /** Records a day once; doing it again (even from two requests at once) changes nothing. */
    @Modifying
    @Query(value = "INSERT INTO activity_days (user_id, day) VALUES (:userId, :day) ON CONFLICT DO NOTHING",
           nativeQuery = true)
    void addIfMissing(Long userId, LocalDate day);

    @Modifying
    @Query("DELETE FROM ActivityDay d WHERE d.userId = :userId")
    void deleteAllForUser(Long userId);
}
