package com.codepath.platform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "practice_problems")
public class PracticeProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnore
    private Topic topic;

    @Column(nullable = false, length = 250)
    private String title;

    @Column(nullable = false, length = 50)
    private String platform = "LeetCode";

    @Column(name = "external_url", nullable = false, columnDefinition = "TEXT")
    private String externalUrl;

    @Column(nullable = false, length = 30)
    private String difficulty;

    @Column(name = "problem_type", nullable = false, length = 100)
    private String problemType = "Core Algorithm";

    public PracticeProblem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }

    public Long getTopicId() { return topic != null ? topic.getId() : null; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getExternalUrl() { return externalUrl; }
    public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getProblemType() { return problemType; }
    public void setProblemType(String problemType) { this.problemType = problemType; }
}
