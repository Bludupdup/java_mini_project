package com.codepath.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** One row per user who changed a setting; users without a row get the defaults. */
@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    public static final String DEFAULT_SPEED = "normal";

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "display_name", nullable = false, length = 40)
    private String displayName = "";

    @Column(name = "playback_speed", nullable = false, length = 10)
    private String playbackSpeed = DEFAULT_SPEED;

    @Column(name = "reduce_motion", nullable = false)
    private boolean reduceMotion = false;

    @Column(name = "notifications_seen_at")
    private Instant notificationsSeenAt;

    protected UserPreferences() {}

    public UserPreferences(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() { return userId; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPlaybackSpeed() { return playbackSpeed; }
    public void setPlaybackSpeed(String playbackSpeed) { this.playbackSpeed = playbackSpeed; }

    public boolean isReduceMotion() { return reduceMotion; }
    public void setReduceMotion(boolean reduceMotion) { this.reduceMotion = reduceMotion; }

    public Instant getNotificationsSeenAt() { return notificationsSeenAt; }
    public void setNotificationsSeenAt(Instant notificationsSeenAt) { this.notificationsSeenAt = notificationsSeenAt; }
}
