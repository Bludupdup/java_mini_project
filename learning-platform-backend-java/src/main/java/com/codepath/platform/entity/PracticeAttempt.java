package com.codepath.platform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "practice_attempts")
public class PracticeAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practice_problem_id", nullable = false)
    @JsonIgnore
    private PracticeProblem practiceProblem;

    @Column(name = "attempt_status", nullable = false, length = 30)
    private String attemptStatus; // SOLVED, ATTEMPTED, REVISIT

    @Column(name = "verification_status", nullable = false, length = 30)
    private String verificationStatus = "SELF_REPORTED"; // SELF_REPORTED, VERIFIED

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    public PracticeAttempt() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Long getUserId() { return user != null ? user.getId() : null; }

    public PracticeProblem getPracticeProblem() { return practiceProblem; }
    public void setPracticeProblem(PracticeProblem practiceProblem) { this.practiceProblem = practiceProblem; }
    public Long getPracticeProblemId() { return practiceProblem != null ? practiceProblem.getId() : null; }

    public String getAttemptStatus() { return attemptStatus; }
    public void setAttemptStatus(String attemptStatus) { this.attemptStatus = attemptStatus; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
