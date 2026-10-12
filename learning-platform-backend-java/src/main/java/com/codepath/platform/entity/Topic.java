package com.codepath.platform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "topics")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    @JsonIgnore
    private Stage stage;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sequence_number", nullable = false, unique = true)
    private Integer sequenceNumber;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TopicVideo> videos = new ArrayList<>();

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PracticeProblem> practiceProblems = new ArrayList<>();

    @OneToOne(mappedBy = "topic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Lesson lesson;

    public Topic() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Stage getStage() { return stage; }
    public void setStage(Stage stage) { this.stage = stage; }

    public Long getStageId() { return stage != null ? stage.getId() : null; }
    public String getStageName() { return stage != null ? stage.getName() : null; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSequenceNumber() { return sequenceNumber; }
    public void setSequenceNumber(Integer sequenceNumber) { this.sequenceNumber = sequenceNumber; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public List<TopicVideo> getVideos() { return videos; }
    public void setVideos(List<TopicVideo> videos) { this.videos = videos; }

    public List<PracticeProblem> getPracticeProblems() { return practiceProblems; }
    public void setPracticeProblems(List<PracticeProblem> practiceProblems) { this.practiceProblems = practiceProblems; }

    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }
}
