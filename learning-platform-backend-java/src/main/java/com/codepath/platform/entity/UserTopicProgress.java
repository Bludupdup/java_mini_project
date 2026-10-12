package com.codepath.platform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_topic_progress", uniqueConstraints = {
    @UniqueConstraint(name = "uq_user_topic", columnNames = {"user_id", "topic_id"})
})
public class UserTopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnore
    private Topic topic;

    @Column(name = "theory_completed", nullable = false)
    private Boolean theoryCompleted = false;

    @Column(name = "code_completed", nullable = false)
    private Boolean codeCompleted = false;

    @Column(name = "practice_completed_count", nullable = false)
    private Integer practiceCompletedCount = 0;

    @Column(nullable = false, length = 30)
    private String status = "NOT_STARTED";

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public UserTopicProgress() {}

    public UserTopicProgress(User user, Topic topic) {
        this.user = user;
        this.topic = topic;
        this.theoryCompleted = false;
        this.codeCompleted = false;
        this.practiceCompletedCount = 0;
        this.status = "NOT_STARTED";
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Long getUserId() { return user != null ? user.getId() : null; }

    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }
    public Long getTopicId() { return topic != null ? topic.getId() : null; }

    public Boolean getTheoryCompleted() { return theoryCompleted; }
    public void setTheoryCompleted(Boolean theoryCompleted) { this.theoryCompleted = theoryCompleted; }

    public Boolean getCodeCompleted() { return codeCompleted; }
    public void setCodeCompleted(Boolean codeCompleted) { this.codeCompleted = codeCompleted; }

    public Integer getPracticeCompletedCount() { return practiceCompletedCount; }
    public void setPracticeCompletedCount(Integer practiceCompletedCount) { this.practiceCompletedCount = practiceCompletedCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
