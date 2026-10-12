package com.codepath.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "framework", "Spring Boot 3.3.4 (Java 17)",
            "timestamp", Instant.now().toString(),
            "authentication", "Spring Security + JWT",
            "database", "PostgreSQL"
        ));
    }

    @GetMapping("/")
    public ResponseEntity<?> root() {
        return ResponseEntity.ok(Map.of(
            "service", "DSA Learning Platform Backend API",
            "version", "1.0.0",
            "framework", "Spring Boot 3",
            "docs", Map.of(
                "auth_register", "POST /api/auth/register",
                "auth_login", "POST /api/auth/login",
                "auth_me", "GET /api/auth/me",
                "stages", "GET /api/stages",
                "topics", "GET /api/topics",
                "topic_detail", "GET /api/topics/{identifier}",
                "lesson", "GET /api/topics/{topicId}/lesson",
                "progress_update", "POST /api/progress/topic",
                "practice_attempt", "POST /api/progress/practice-attempt",
                "dashboard", "GET /api/progress/dashboard"
            )
        ));
    }
}
