package com.codepath.platform.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    private final JdbcTemplate jdbcTemplate;

    public HomeController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** Is the server up, and can it reach the database? */
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        boolean databaseUp;
        try {
            databaseUp = jdbcTemplate.queryForObject("SELECT 1", Integer.class) == 1;
        } catch (Exception e) {
            databaseUp = false;
        }

        return ResponseEntity.status(databaseUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", databaseUp ? "ok" : "database unreachable"));
    }

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, String> routes = new LinkedHashMap<>();
        routes.put("health", "GET /api/health");
        routes.put("register", "POST /api/auth/register");
        routes.put("login", "POST /api/auth/login");
        routes.put("logout", "POST /api/auth/logout");
        routes.put("me", "GET /api/auth/me");
        routes.put("topics", "GET /api/topics");
        routes.put("topic", "GET /api/topics/{slug}");
        routes.put("algorithms", "GET /api/algorithms");
        routes.put("algorithm", "GET /api/algorithms/{slug}");
        routes.put("learning", "GET | PUT | DELETE /api/learning (see README)");

        return Map.of("service", "DSA Universe backend", "routes", routes);
    }
}
