package com.codepath.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** An achievement the user unlocked. The achievements themselves are defined in the frontend. */
@Entity
@Table(name = "user_achievements")
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "achievement_id", nullable = false, length = 60)
    private String achievementId;

    @Column(name = "unlocked_at", nullable = false)
    private Instant unlockedAt;

    protected UserAchievement() {}

    public UserAchievement(Long userId, String achievementId, Instant unlockedAt) {
        this.userId = userId;
        this.achievementId = achievementId;
        this.unlockedAt = unlockedAt;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getAchievementId() { return achievementId; }
    public Instant getUnlockedAt() { return unlockedAt; }
}
