package com.codepath.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/** A local calendar day on which the user studied (used for streaks). */
@Entity
@Table(name = "activity_days")
public class ActivityDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate day;

    protected ActivityDay() {}

    public ActivityDay(Long userId, LocalDate day) {
        this.userId = userId;
        this.day = day;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public LocalDate getDay() { return day; }
}
