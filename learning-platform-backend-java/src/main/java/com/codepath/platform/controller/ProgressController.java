package com.codepath.platform.controller;

import com.codepath.platform.dto.ProgressDtos.*;
import com.codepath.platform.entity.PracticeAttempt;
import com.codepath.platform.entity.User;
import com.codepath.platform.entity.UserTopicProgress;
import com.codepath.platform.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/topic")
    public ResponseEntity<?> updateTopicProgress(@Valid @RequestBody UpdateProgressRequest req,
                                                 @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "Unauthorized. Please provide Bearer token."));
        }

        UserTopicProgress progress = progressService.updateTopicProgress(user, req);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Topic progress updated successfully.",
            "data", progress
        ));
    }

    @PostMapping("/practice-attempt")
    public ResponseEntity<?> recordPracticeAttempt(@Valid @RequestBody RecordAttemptRequest req,
                                                   @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "Unauthorized. Please provide Bearer token."));
        }

        PracticeAttempt attempt = progressService.recordPracticeAttempt(user, req);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Practice attempt recorded successfully.",
            "data", attempt
        ));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardSummary(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "Unauthorized. Please provide Bearer token."));
        }

        DashboardSummaryDto summary = progressService.getDashboardSummary(user);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", summary
        ));
    }
}
