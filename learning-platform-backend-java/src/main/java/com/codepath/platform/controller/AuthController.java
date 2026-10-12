package com.codepath.platform.controller;

import com.codepath.platform.dto.AuthDtos.*;
import com.codepath.platform.entity.User;
import com.codepath.platform.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User registered successfully.",
                "data", response
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Login successful.",
                "data", response
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "error", "Unauthorized"
            ));
        }
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole())
        ));
    }
}
