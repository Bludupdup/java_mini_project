package com.codepath.platform.controller;

import com.codepath.platform.config.AuthenticatedUser;
import com.codepath.platform.dto.LearningDtos.*;
import com.codepath.platform.service.LearningService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;

/**
 * The logged-in user's progress, bookmarks, solved problems, notes,
 * achievements and preferences. Every route here needs a login (see SecurityConfig).
 *
 * Changes answer 204 No Content: the frontend has already updated its screen
 * and only needs to know the change was saved.
 */
@RestController
@RequestMapping("/api/learning")
public class LearningController {

    private final LearningService learningService;

    public LearningController(LearningService learningService) {
        this.learningService = learningService;
    }

    @GetMapping
    public LearningState getState(@AuthenticationPrincipal AuthenticatedUser user) {
        return learningService.getState(user.id());
    }

    /** Settings → Import: replace everything with the uploaded data. */
    @PutMapping
    public LearningState replaceState(@AuthenticationPrincipal AuthenticatedUser user,
                                      @RequestBody LearningState state) {
        return learningService.replaceState(user.id(), state);
    }

    /** Settings → Erase everything. */
    @DeleteMapping
    public ResponseEntity<Void> resetEverything(@AuthenticationPrincipal AuthenticatedUser user) {
        learningService.resetEverything(user.id());
        return ResponseEntity.noContent().build();
    }

    /** Settings → Reset progress (keeps saved topics, notes and preferences). */
    @DeleteMapping("/progress")
    public ResponseEntity<Void> resetProgress(@AuthenticationPrincipal AuthenticatedUser user) {
        learningService.resetProgress(user.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/topics/{slug}/visit")
    public ResponseEntity<Void> visitTopic(@AuthenticationPrincipal AuthenticatedUser user,
                                           @PathVariable String slug,
                                           @RequestHeader(value = "X-Time-Zone", required = false) String timeZone) {
        learningService.visitTopic(user.id(), slug, today(timeZone));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/topics/{slug}/completed")
    public ResponseEntity<Void> setCompleted(@AuthenticationPrincipal AuthenticatedUser user,
                                             @PathVariable String slug,
                                             @Valid @RequestBody CompletedRequest request,
                                             @RequestHeader(value = "X-Time-Zone", required = false) String timeZone) {
        learningService.setCompleted(user.id(), slug, request.completed(), today(timeZone));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/topics/{slug}/visualization")
    public ResponseEntity<Void> recordStep(@AuthenticationPrincipal AuthenticatedUser user,
                                           @PathVariable String slug,
                                           @Valid @RequestBody StepRequest request,
                                           @RequestHeader(value = "X-Time-Zone", required = false) String timeZone) {
        learningService.recordStep(user.id(), slug, request.step(), request.total(), today(timeZone));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/bookmarks/{slug}")
    public ResponseEntity<Void> addBookmark(@AuthenticationPrincipal AuthenticatedUser user,
                                            @PathVariable String slug) {
        learningService.setBookmark(user.id(), slug, true);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bookmarks/{slug}")
    public ResponseEntity<Void> removeBookmark(@AuthenticationPrincipal AuthenticatedUser user,
                                               @PathVariable String slug) {
        learningService.setBookmark(user.id(), slug, false);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/problems/{slug}/solved")
    public ResponseEntity<Void> setSolved(@AuthenticationPrincipal AuthenticatedUser user,
                                          @PathVariable String slug,
                                          @Valid @RequestBody SolvedRequest request,
                                          @RequestHeader(value = "X-Time-Zone", required = false) String timeZone) {
        learningService.setSolved(user.id(), slug, request.solved(), today(timeZone));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/problems/{slug}/note")
    public ResponseEntity<Void> setNote(@AuthenticationPrincipal AuthenticatedUser user,
                                        @PathVariable String slug,
                                        @Valid @RequestBody NoteRequest request) {
        learningService.setNote(user.id(), slug, request.note());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/achievements")
    public ResponseEntity<Void> unlockAchievements(@AuthenticationPrincipal AuthenticatedUser user,
                                                   @Valid @RequestBody AchievementsRequest request) {
        learningService.unlockAchievements(user.id(), request.ids());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/notifications-seen")
    public ResponseEntity<Void> markNotificationsRead(@AuthenticationPrincipal AuthenticatedUser user) {
        learningService.markNotificationsRead(user.id());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/preferences")
    public ResponseEntity<Void> updatePreferences(@AuthenticationPrincipal AuthenticatedUser user,
                                                  @Valid @RequestBody PreferencesRequest request) {
        learningService.updatePreferences(user.id(), request);
        return ResponseEntity.noContent().build();
    }

    // Streaks count the learner's own calendar days, so the browser sends its
    // time zone (e.g. "Asia/Kolkata"). Without one, the server's zone is used.
    private static LocalDate today(String timeZone) {
        try {
            return LocalDate.now(timeZone == null ? ZoneId.systemDefault() : ZoneId.of(timeZone));
        } catch (DateTimeException e) {
            return LocalDate.now();
        }
    }
}
