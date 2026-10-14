package com.codepath.platform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

/**
 * JSON for /api/learning. LearningState has exactly the shape of the
 * frontend's learning state (see src/learning/learningStore.js): ids are
 * slugs and times are milliseconds since 1970, like JavaScript's Date.now().
 */
public class LearningDtos {

    public static final int MAX_NOTE_LENGTH = 2000;
    public static final int MAX_NAME_LENGTH = 40;
    public static final String ACHIEVEMENT_ID = "[a-z0-9-]{1,60}";

    public record LearningState(
            List<String> bookmarks,
            Map<String, TopicRecord> topics,
            Map<String, ProblemRecord> problems,
            List<String> activityDays,
            Map<String, Long> achievements,
            Long notificationsSeenAt,
            Preferences preferences) {}

    public record TopicRecord(Long visitedAt, Long completedAt, Visualization visualization) {}

    public record Visualization(int seen, int total) {}

    public record ProblemRecord(Long solvedAt, String note) {}

    public record Preferences(String name, String playbackSpeed, Boolean reduceMotion) {}

    // ---- Request bodies for single changes ----

    public record CompletedRequest(@NotNull Boolean completed) {}

    /** The learner is looking at step `step` (0-based) of a visualization with `total` steps. */
    public record StepRequest(@NotNull @Min(0) Integer step, @NotNull @Min(1) @Max(500) Integer total) {}

    public record SolvedRequest(@NotNull Boolean solved) {}

    public record NoteRequest(@NotNull @Size(max = MAX_NOTE_LENGTH) String note) {}

    public record AchievementsRequest(
            @NotNull @Size(max = 50) List<@NotNull @Pattern(regexp = ACHIEVEMENT_ID) String> ids) {}

    /** Only the fields that are present change. */
    public record PreferencesRequest(
            @Size(max = MAX_NAME_LENGTH) String name,
            @Pattern(regexp = "slow|normal|fast") String playbackSpeed,
            Boolean reduceMotion) {}
}
