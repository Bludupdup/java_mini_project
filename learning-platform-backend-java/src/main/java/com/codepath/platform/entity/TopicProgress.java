package com.codepath.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** How far one user has got with one topic. */
@Entity
@Table(name = "topic_progress")
public class TopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "visited_at")
    private Instant visitedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    // Furthest visualization step reached, out of stepsTotal. Both null until
    // the visualization has been watched.
    @Column(name = "steps_seen")
    private Integer stepsSeen;

    @Column(name = "steps_total")
    private Integer stepsTotal;

    protected TopicProgress() {}

    public TopicProgress(Long userId, Topic topic) {
        this.userId = userId;
        this.topic = topic;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Topic getTopic() { return topic; }

    public Instant getVisitedAt() { return visitedAt; }
    public void setVisitedAt(Instant visitedAt) { this.visitedAt = visitedAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public Integer getStepsSeen() { return stepsSeen; }
    public Integer getStepsTotal() { return stepsTotal; }

    public void setSteps(Integer seen, Integer total) {
        this.stepsSeen = seen;
        this.stepsTotal = total;
    }
}
