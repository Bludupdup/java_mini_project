package com.codepath.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** A topic the user saved for later. */
@Entity
@Table(name = "bookmarks")
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Bookmark() {}

    public Bookmark(Long userId, Topic topic, Instant createdAt) {
        this.userId = userId;
        this.topic = topic;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Topic getTopic() { return topic; }
    public Instant getCreatedAt() { return createdAt; }
}
