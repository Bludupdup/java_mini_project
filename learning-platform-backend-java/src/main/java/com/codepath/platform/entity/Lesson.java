package com.codepath.platform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false, unique = true)
    @JsonIgnore
    private Topic topic;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String theory;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String algorithm;

    @Column(name = "code_examples", nullable = false, columnDefinition = "TEXT")
    private String codeExamples;

    @Column(name = "time_complexity", nullable = false, columnDefinition = "TEXT")
    private String timeComplexity;

    @Column(name = "space_complexity", nullable = false, columnDefinition = "TEXT")
    private String spaceComplexity;

    @Column(name = "practice_questions", columnDefinition = "TEXT")
    private String practiceQuestions = "[]";

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(name = "content_version", nullable = false)
    private Integer contentVersion = 1;

    public Lesson() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }

    public Long getTopicId() { return topic != null ? topic.getId() : null; }

    public String getTheory() { return theory; }
    public void setTheory(String theory) { this.theory = theory; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public String getCodeExamples() { return codeExamples; }
    public void setCodeExamples(String codeExamples) { this.codeExamples = codeExamples; }

    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }

    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }

    public String getPracticeQuestions() { return practiceQuestions; }
    public void setPracticeQuestions(String practiceQuestions) { this.practiceQuestions = practiceQuestions; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public Integer getContentVersion() { return contentVersion; }
    public void setContentVersion(Integer contentVersion) { this.contentVersion = contentVersion; }
}
