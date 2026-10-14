package com.codepath.platform.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

import java.util.ArrayList;
import java.util.List;

/**
 * One topic and its lesson content. The catalog is filled by
 * db/migration/R__seed_catalog.sql and only ever read by the app.
 */
@Entity
@Immutable
@Table(name = "topics")
public class Topic {

    @Id
    private Long id;

    // The id the frontend uses, e.g. "arrays" in /topics/arrays.
    @Column(nullable = false, unique = true)
    private String slug;

    private String title;
    private String category;
    private String description;
    private String level;

    @Column(name = "lesson_count")
    private int lessonCount;

    @Column(name = "read_time")
    private String readTime;

    private String icon;
    private String color;
    private String theory;
    private String tip;
    private String pseudocode;

    @Column(name = "sort_order")
    private int sortOrder;

    // Each list lives in its own table, one row per item; "position" keeps the order.
    @ElementCollection
    @CollectionTable(name = "topic_structures", joinColumns = @JoinColumn(name = "topic_id"))
    @OrderColumn(name = "position")
    @Column(name = "name")
    private List<String> structures = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "topic_steps", joinColumns = @JoinColumn(name = "topic_id"))
    @OrderColumn(name = "position")
    @Column(name = "content")
    private List<String> steps = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "topic_complexities", joinColumns = @JoinColumn(name = "topic_id"))
    @OrderColumn(name = "position")
    private List<ComplexityRow> complexity = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "topic_resources", joinColumns = @JoinColumn(name = "topic_id"))
    @OrderColumn(name = "position")
    private List<TopicResource> resources = new ArrayList<>();

    @OneToMany(mappedBy = "topic")
    @OrderBy("position")
    private List<PracticeProblem> problems = new ArrayList<>();

    // Algorithms from the library that belong to this topic.
    @OneToMany(mappedBy = "topic")
    @OrderBy("displayOrder")
    private List<Algorithm> algorithms = new ArrayList<>();

    protected Topic() {}

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public String getLevel() { return level; }
    public int getLessonCount() { return lessonCount; }
    public String getReadTime() { return readTime; }
    public String getIcon() { return icon; }
    public String getColor() { return color; }
    public String getTheory() { return theory; }
    public String getTip() { return tip; }
    public String getPseudocode() { return pseudocode; }
    public int getSortOrder() { return sortOrder; }
    public List<String> getStructures() { return structures; }
    public List<String> getSteps() { return steps; }
    public List<ComplexityRow> getComplexity() { return complexity; }
    public List<TopicResource> getResources() { return resources; }
    public List<PracticeProblem> getProblems() { return problems; }
    public List<Algorithm> getAlgorithms() { return algorithms; }
}
