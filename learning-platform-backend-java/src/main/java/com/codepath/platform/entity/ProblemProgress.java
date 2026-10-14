package com.codepath.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** Whether one user solved one practice problem, and their note about it. */
@Entity
@Table(name = "problem_progress")
public class ProblemProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private PracticeProblem problem;

    @Column(name = "solved_at")
    private Instant solvedAt;

    private String note;

    protected ProblemProgress() {}

    public ProblemProgress(Long userId, PracticeProblem problem) {
        this.userId = userId;
        this.problem = problem;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public PracticeProblem getProblem() { return problem; }

    public Instant getSolvedAt() { return solvedAt; }
    public void setSolvedAt(Instant solvedAt) { this.solvedAt = solvedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    /** Nothing left worth keeping: the row can be deleted. */
    public boolean isEmpty() {
        return solvedAt == null && note == null;
    }
}
