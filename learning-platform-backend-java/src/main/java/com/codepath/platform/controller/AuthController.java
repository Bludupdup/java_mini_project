package com.codepath.platform.controller;

import com.codepath.platform.config.AuthenticatedUser;
import com.codepath.platform.config.SessionCookie;
import com.codepath.platform.dto.AuthDtos.LoginRequest;
import com.codepath.platform.dto.AuthDtos.RegisterRequest;
import com.codepath.platform.dto.AuthDtos.UserDto;
import com.codepath.platform.dto.AuthDtos.UserResponse;
import com.codepath.platform.service.AuthService;
import com.codepath.platform.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Register, log in, log out, and "who am I?".
 *
 * Logging in sets a cookie holding a JWT. The cookie is:
 *   HttpOnly  page scripts can't read it, so injected code can't steal it
 *   SameSite  other sites can't send it along with their own requests
 * The browser then sends it automatically with every request to /api.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest body, HttpServletRequest request) {
        return startSession(HttpStatus.CREATED, authService.register(body), request);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest body, HttpServletRequest request) {
        return startSession(HttpStatus.OK, authService.login(body), request);
    }

    // A JWT can't be cancelled on the server; logging out deletes the cookie
    // that holds it, so this browser stops sending it.
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Boolean>> logout(HttpServletRequest request) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, SessionCookie.expired(request.isSecure()).toString())
                .body(Map.of("ok", true));
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AuthenticatedUser user) {
        return new UserResponse(new UserDto(user.id(), user.name(), user.email()));
    }

    private ResponseEntity<UserResponse> startSession(HttpStatus status, UserDto user, HttpServletRequest request) {
        String token = jwtService.createToken(user.id());

        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE,
                        SessionCookie.create(token, jwtService.getLifetime(), request.isSecure()).toString())
                .body(new UserResponse(user));
    }
}
