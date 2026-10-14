package com.codepath.platform.repository;

import com.codepath.platform.entity.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    List<UserAchievement> findByUserId(Long userId);

    /** Unlocking twice keeps the first unlock time. */
    @Modifying
    @Query(value = "INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) "
                 + "VALUES (:userId, :achievementId, :unlockedAt) ON CONFLICT DO NOTHING",
           nativeQuery = true)
    void addIfMissing(Long userId, String achievementId, Instant unlockedAt);

    @Modifying
    @Query("DELETE FROM UserAchievement a WHERE a.userId = :userId")
    void deleteAllForUser(Long userId);
}
