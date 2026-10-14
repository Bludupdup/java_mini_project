package com.codepath.platform.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

/**
 * One algorithm in the library (the team's "algorithms" table): its
 * explanation, a C++ program with the output it prints, complexities and
 * a practice problem. Filled by db/migration/R__seed_catalog_algorithms.sql.
 */
@Entity
@Immutable
@Table(name = "algorithms")
public class Algorithm {

    @Id
    private Long id;

    private String name;

    // The id the frontend uses, e.g. "merge-sort" in /algorithms/merge-sort.
    @Column(nullable = false, unique = true)
    private String slug;

    // The topic it belongs to; null if that topic was removed.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(name = "display_order")
    private int displayOrder;

    private String description;
    private String working;
    private String example;

    @Column(name = "cpp_code")
    private String cppCode;

    private String output;
    private String recurrence;

    @Column(name = "best_complexity")
    private String bestComplexity;

    @Column(name = "average_complexity")
    private String averageComplexity;

    @Column(name = "worst_complexity")
    private String worstComplexity;

    @Column(name = "space_complexity")
    private String spaceComplexity;

    private String applications;
    private String advantages;
    private String disadvantages;

    @Column(name = "youtube_url")
    private String youtubeUrl;

    @Column(name = "leetcode_title")
    private String leetcodeTitle;

    @Column(name = "leetcode_url")
    private String leetcodeUrl;

    @Column(name = "leetcode_difficulty")
    private String leetcodeDifficulty;

    protected Algorithm() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public Topic getTopic() { return topic; }
    public int getDisplayOrder() { return displayOrder; }
    public String getDescription() { return description; }
    public String getWorking() { return working; }
    public String getExample() { return example; }
    public String getCppCode() { return cppCode; }
    public String getOutput() { return output; }
    public String getRecurrence() { return recurrence; }
    public String getBestComplexity() { return bestComplexity; }
    public String getAverageComplexity() { return averageComplexity; }
    public String getWorstComplexity() { return worstComplexity; }
    public String getSpaceComplexity() { return spaceComplexity; }
    public String getApplications() { return applications; }
    public String getAdvantages() { return advantages; }
    public String getDisadvantages() { return disadvantages; }
    public String getYoutubeUrl() { return youtubeUrl; }
    public String getLeetcodeTitle() { return leetcodeTitle; }
    public String getLeetcodeUrl() { return leetcodeUrl; }
    public String getLeetcodeDifficulty() { return leetcodeDifficulty; }
}
