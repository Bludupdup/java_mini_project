package com.codepath.platform.service;

import com.codepath.platform.dto.LearningDtos.LearningState;
import com.codepath.platform.dto.LearningDtos.Preferences;
import com.codepath.platform.dto.LearningDtos.PreferencesRequest;
import com.codepath.platform.dto.LearningDtos.ProblemRecord;
import com.codepath.platform.dto.LearningDtos.TopicRecord;
import com.codepath.platform.dto.LearningDtos.Visualization;
import com.codepath.platform.entity.*;
import com.codepath.platform.exception.ApiException;
import com.codepath.platform.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.codepath.platform.dto.LearningDtos.ACHIEVEMENT_ID;
import static com.codepath.platform.dto.LearningDtos.MAX_NAME_LENGTH;
import static com.codepath.platform.dto.LearningDtos.MAX_NOTE_LENGTH;

/**
 * Everything a learner has done and chosen, stored per user. Each method is
 * the database version of one action in the frontend's learningReducer
 * (src/learning/learningStore.js), so both sides agree on what happens.
 *
 * Every change starts by locking the user's row (lockUser), so two changes
 * for one user (two tabs, a double click) run one after the other instead
 * of tripping over each other's inserts.
 */
@Service
@Transactional
public class LearningService {

    private static final int MAX_ACTIVITY_DAYS = 400;
    private static final Set<String> SPEEDS = Set.of("slow", "normal", "fast");
    // Times outside 1970-2100 are treated as missing (they come from imported files).
    private static final long LATEST_MILLIS = 4_102_444_800_000L;

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final PracticeProblemRepository problemRepository;
    private final TopicProgressRepository topicProgressRepository;
    private final BookmarkRepository bookmarkRepository;
    private final ProblemProgressRepository problemProgressRepository;
    private final ActivityDayRepository activityDayRepository;
    private final UserAchievementRepository achievementRepository;
    private final UserPreferencesRepository preferencesRepository;

    public LearningService(UserRepository userRepository,
                           TopicRepository topicRepository,
                           PracticeProblemRepository problemRepository,
                           TopicProgressRepository topicProgressRepository,
                           BookmarkRepository bookmarkRepository,
                           ProblemProgressRepository problemProgressRepository,
                           ActivityDayRepository activityDayRepository,
                           UserAchievementRepository achievementRepository,
                           UserPreferencesRepository preferencesRepository) {
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.problemRepository = problemRepository;
        this.topicProgressRepository = topicProgressRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.problemProgressRepository = problemProgressRepository;
        this.activityDayRepository = activityDayRepository;
        this.achievementRepository = achievementRepository;
        this.preferencesRepository = preferencesRepository;
    }

    // ------------------------------------------------------------------
    // Reading
    // ------------------------------------------------------------------

    /** All of one user's learning data, in the frontend's state shape. */
    @Transactional(readOnly = true)
    public LearningState getState(Long userId) {
        List<String> bookmarks = bookmarkRepository.findAllForUser(userId).stream()
                .map(bookmark -> bookmark.getTopic().getSlug())
                .toList();

        Map<String, TopicRecord> topics = new LinkedHashMap<>();
        for (TopicProgress progress : topicProgressRepository.findAllForUser(userId)) {
            Visualization visualization = progress.getStepsTotal() == null
                    ? null
                    : new Visualization(progress.getStepsSeen(), progress.getStepsTotal());
            topics.put(progress.getTopic().getSlug(), new TopicRecord(
                    millis(progress.getVisitedAt()), millis(progress.getCompletedAt()), visualization));
        }

        Map<String, ProblemRecord> problems = new LinkedHashMap<>();
        for (ProblemProgress record : problemProgressRepository.findAllForUser(userId)) {
            problems.put(record.getProblem().getSlug(),
                    new ProblemRecord(millis(record.getSolvedAt()), record.getNote()));
        }

        List<String> days = activityDayRepository.findByUserIdOrderByDayAsc(userId).stream()
                .map(day -> day.getDay().toString())
                .toList();
        List<String> recentDays = days.subList(Math.max(0, days.size() - MAX_ACTIVITY_DAYS), days.size());

        Map<String, Long> achievements = new LinkedHashMap<>();
        for (UserAchievement achievement : achievementRepository.findByUserId(userId)) {
            achievements.put(achievement.getAchievementId(), millis(achievement.getUnlockedAt()));
        }

        UserPreferences preferences = preferencesFor(userId);
        Long seenAt = millis(preferences.getNotificationsSeenAt());

        return new LearningState(
                bookmarks,
                topics,
                problems,
                recentDays,
                achievements,
                seenAt == null ? 0L : seenAt,
                new Preferences(preferences.getDisplayName(), preferences.getPlaybackSpeed(),
                        preferences.isReduceMotion()));
    }

    // ------------------------------------------------------------------
    // Topics
    // ------------------------------------------------------------------

    public void visitTopic(Long userId, String topicSlug, LocalDate today) {
        lockUser(userId);
        TopicProgress progress = progressFor(userId, findTopic(topicSlug));
        progress.setVisitedAt(Instant.now());
        topicProgressRepository.save(progress);
        addActivityDay(userId, today);
    }

    public void setCompleted(Long userId, String topicSlug, boolean completed, LocalDate today) {
        lockUser(userId);
        TopicProgress progress = progressFor(userId, findTopic(topicSlug));
        progress.setCompletedAt(completed ? Instant.now() : null);
        topicProgressRepository.save(progress);
        addActivityDay(userId, today);
    }

    /** The learner reached step `step` (0-based) of a visualization with `total` steps. */
    public void recordStep(Long userId, String topicSlug, int step, int total, LocalDate today) {
        lockUser(userId);
        if (step >= total) throw ApiException.badRequest("\"step\" must be smaller than \"total\".");

        TopicProgress progress = progressFor(userId, findTopic(topicSlug));
        boolean samePlan = Objects.equals(progress.getStepsTotal(), total);
        // A regenerated plan with a different number of steps starts over.
        int seenBefore = samePlan ? progress.getStepsSeen() : 0;
        int seen = Math.min(total, Math.max(seenBefore, step + 1));

        if (samePlan && seen == seenBefore) return; // nothing new

        progress.setSteps(seen, total);
        topicProgressRepository.save(progress);
        addActivityDay(userId, today);
    }

    public void setBookmark(Long userId, String topicSlug, boolean saved) {
        lockUser(userId);
        Topic topic = findTopic(topicSlug);

        if (!saved) {
            bookmarkRepository.deleteOne(userId, topic.getId());
        } else if (!bookmarkRepository.existsByUserIdAndTopicId(userId, topic.getId())) {
            bookmarkRepository.save(new Bookmark(userId, topic, Instant.now()));
        }
    }

    // ------------------------------------------------------------------
    // Practice problems
    // ------------------------------------------------------------------

    public void setSolved(Long userId, String problemSlug, boolean solved, LocalDate today) {
        lockUser(userId);
        ProblemProgress record = problemProgressFor(userId, findProblem(problemSlug));

        if (solved == (record.getSolvedAt() != null)) return; // already that way

        record.setSolvedAt(solved ? Instant.now() : null);
        saveOrDelete(record);
        // Solving counts as studying today; undoing a mistake doesn't.
        if (solved) addActivityDay(userId, today);
    }

    public void setNote(Long userId, String problemSlug, String note) {
        lockUser(userId);
        ProblemProgress record = problemProgressFor(userId, findProblem(problemSlug));
        record.setNote(note.isBlank() ? null : note);
        saveOrDelete(record);
    }

    // ------------------------------------------------------------------
    // Achievements, notifications and preferences
    // ------------------------------------------------------------------

    public void unlockAchievements(Long userId, List<String> ids) {
        lockUser(userId);
        Instant now = Instant.now();
        for (String id : new LinkedHashSet<>(ids)) {
            achievementRepository.addIfMissing(userId, id, now);
        }
    }

    public void markNotificationsRead(Long userId) {
        lockUser(userId);
        UserPreferences preferences = preferencesFor(userId);
        preferences.setNotificationsSeenAt(Instant.now());
        preferencesRepository.save(preferences);
    }

    public void updatePreferences(Long userId, PreferencesRequest request) {
        lockUser(userId);
        UserPreferences preferences = preferencesFor(userId);

        if (request.name() != null) preferences.setDisplayName(request.name());
        if (request.playbackSpeed() != null) preferences.setPlaybackSpeed(request.playbackSpeed());
        if (request.reduceMotion() != null) preferences.setReduceMotion(request.reduceMotion());

        preferencesRepository.save(preferences);
    }

    // ------------------------------------------------------------------
    // Resetting and importing
    // ------------------------------------------------------------------

    /** Clears progress, solved marks and achievements; keeps saved topics, notes and preferences. */
    public void resetProgress(Long userId) {
        lockUser(userId);
        topicProgressRepository.deleteAllForUser(userId);
        problemProgressRepository.deleteWithoutNoteForUser(userId);
        problemProgressRepository.clearSolvedForUser(userId);
        activityDayRepository.deleteAllForUser(userId);
        achievementRepository.deleteAllForUser(userId);

        UserPreferences preferences = preferencesFor(userId);
        preferences.setNotificationsSeenAt(null);
        preferencesRepository.save(preferences);
    }

    /** Clears everything, including saved topics, notes and preferences. */
    public void resetEverything(Long userId) {
        lockUser(userId);
        topicProgressRepository.deleteAllForUser(userId);
        bookmarkRepository.deleteAllForUser(userId);
        problemProgressRepository.deleteAllForUser(userId);
        activityDayRepository.deleteAllForUser(userId);
        achievementRepository.deleteAllForUser(userId);

        UserPreferences preferences = preferencesFor(userId);
        preferences.setDisplayName("");
        preferences.setPlaybackSpeed(UserPreferences.DEFAULT_SPEED);
        preferences.setReduceMotion(false);
        preferences.setNotificationsSeenAt(null);
        preferencesRepository.save(preferences);
    }

    /**
     * Replaces all of a user's data with an imported file (Settings → Import).
     * Unknown topics and problems, and values that don't make sense, are
     * skipped instead of failing the whole import.
     */
    public LearningState replaceState(Long userId, LearningState state) {
        lockUser(userId);
        resetEverything(userId);

        Map<String, Topic> topics = topicRepository.findAll().stream()
                .collect(Collectors.toMap(Topic::getSlug, Function.identity()));
        Map<String, PracticeProblem> problems = problemRepository.findAll().stream()
                .collect(Collectors.toMap(PracticeProblem::getSlug, Function.identity()));

        // Bookmarks come newest first; older ones get slightly earlier times to keep the order.
        Instant now = Instant.now();
        List<String> bookmarks = new ArrayList<>(new LinkedHashSet<>(orEmpty(state.bookmarks())));
        for (int i = 0; i < bookmarks.size(); i++) {
            Topic topic = topics.get(bookmarks.get(i));
            if (topic != null) bookmarkRepository.save(new Bookmark(userId, topic, now.minusMillis(i)));
        }

        orEmpty(state.topics()).forEach((slug, record) -> {
            Topic topic = topics.get(slug);
            if (topic == null || record == null) return;

            TopicProgress progress = new TopicProgress(userId, topic);
            progress.setVisitedAt(instant(record.visitedAt()));
            progress.setCompletedAt(instant(record.completedAt()));

            Visualization visualization = record.visualization();
            if (visualization != null && visualization.total() > 0 && visualization.total() <= 500
                    && visualization.seen() >= 0 && visualization.seen() <= visualization.total()) {
                progress.setSteps(visualization.seen(), visualization.total());
            }
            topicProgressRepository.save(progress);
        });

        orEmpty(state.problems()).forEach((slug, record) -> {
            PracticeProblem problem = problems.get(slug);
            if (problem == null || record == null) return;

            ProblemProgress progress = new ProblemProgress(userId, problem);
            progress.setSolvedAt(instant(record.solvedAt()));
            String note = record.note();
            if (note != null && !note.isBlank()) {
                progress.setNote(note.length() > MAX_NOTE_LENGTH ? note.substring(0, MAX_NOTE_LENGTH) : note);
            }
            saveOrDelete(progress);
        });

        TreeSet<LocalDate> days = new TreeSet<>();
        for (String day : orEmpty(state.activityDays())) {
            try {
                days.add(LocalDate.parse(day));
            } catch (DateTimeParseException | NullPointerException ignored) {
                // skip anything that isn't a yyyy-mm-dd date
            }
        }
        days.stream().skip(Math.max(0, days.size() - MAX_ACTIVITY_DAYS))
                .forEach(day -> activityDayRepository.addIfMissing(userId, day));

        orEmpty(state.achievements()).forEach((id, unlockedAt) -> {
            Instant time = instant(unlockedAt);
            if (id != null && id.matches(ACHIEVEMENT_ID) && time != null) {
                achievementRepository.addIfMissing(userId, id, time);
            }
        });

        UserPreferences preferences = preferencesFor(userId);
        Preferences imported = state.preferences();
        if (imported != null) {
            String name = imported.name();
            if (name != null) preferences.setDisplayName(name.length() > MAX_NAME_LENGTH ? name.substring(0, MAX_NAME_LENGTH) : name);
            // Set.of(...).contains(null) throws, so check for a missing speed first.
            String speed = imported.playbackSpeed();
            if (speed != null && SPEEDS.contains(speed)) preferences.setPlaybackSpeed(speed);
            if (imported.reduceMotion() != null) preferences.setReduceMotion(imported.reduceMotion());
        }
        preferences.setNotificationsSeenAt(instant(state.notificationsSeenAt()));
        preferencesRepository.save(preferences);

        return getState(userId);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private void lockUser(Long userId) {
        userRepository.lockById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Your account no longer exists."));
    }

    private Topic findTopic(String slug) {
        return topicRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("There is no topic called \"" + slug + "\"."));
    }

    private PracticeProblem findProblem(String slug) {
        return problemRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("There is no practice problem called \"" + slug + "\"."));
    }

    private TopicProgress progressFor(Long userId, Topic topic) {
        return topicProgressRepository.findByUserIdAndTopicId(userId, topic.getId())
                .orElseGet(() -> new TopicProgress(userId, topic));
    }

    private ProblemProgress problemProgressFor(Long userId, PracticeProblem problem) {
        return problemProgressRepository.findByUserIdAndProblemId(userId, problem.getId())
                .orElseGet(() -> new ProblemProgress(userId, problem));
    }

    private UserPreferences preferencesFor(Long userId) {
        return preferencesRepository.findById(userId).orElseGet(() -> new UserPreferences(userId));
    }

    // A row with no solved mark and no note says nothing, so it isn't kept.
    private void saveOrDelete(ProblemProgress record) {
        if (!record.isEmpty()) problemProgressRepository.save(record);
        else if (record.getId() != null) problemProgressRepository.delete(record);
    }

    private void addActivityDay(Long userId, LocalDate today) {
        activityDayRepository.addIfMissing(userId, today);
    }

    private static Long millis(Instant instant) {
        return instant == null ? null : instant.toEpochMilli();
    }

    private static Instant instant(Long millis) {
        return millis != null && millis > 0 && millis < LATEST_MILLIS ? Instant.ofEpochMilli(millis) : null;
    }

    private static <T> List<T> orEmpty(List<T> list) {
        return list == null ? List.of() : list;
    }

    private static <K, V> Map<K, V> orEmpty(Map<K, V> map) {
        return map == null ? Map.of() : map;
    }
}
