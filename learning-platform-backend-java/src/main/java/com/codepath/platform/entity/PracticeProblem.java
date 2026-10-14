package com.codepath.platform.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "practice_problems")
public class PracticeProblem {

    @Id
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    // The id the frontend uses, taken from the URL: "two-sum".
    @Column(nullable = false, unique = true)
    private String slug;

    private String title;
    private String platform;
    private String difficulty;
    private String url;
    private int position;

    protected PracticeProblem() {}

    public Long getId() { return id; }
    public Topic getTopic() { return topic; }
    public String getSlug() { return slug; }
    public String getTitle() { return title; }
    public String getPlatform() { return platform; }
    public String getDifficulty() { return difficulty; }
    public String getUrl() { return url; }
    public int getPosition() { return position; }
}
