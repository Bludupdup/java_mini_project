package com.codepath.platform.dto;

/**
 * JSON for /api/auth. Fields are checked by AuthValidation (the same rules as
 * the frontend's src/auth/authRules.js), so they are plain strings here.
 */
public class AuthDtos {

    public record RegisterRequest(String name, String email, String password) {}

    public record LoginRequest(String email, String password) {}

    /** What the frontend may know about a user. Never the password hash. */
    public record UserDto(Long id, String name, String email) {}

    /**
     * { "user": {...} }. The login token is not in here: it travels only in an
     * HttpOnly cookie, which page scripts can't read.
     */
    public record UserResponse(UserDto user) {}
}
