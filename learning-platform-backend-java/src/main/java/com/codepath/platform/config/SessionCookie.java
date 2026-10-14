package com.codepath.platform.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;

import java.time.Duration;
import java.util.Optional;

/** The login cookie that carries the JWT between the browser and this server. */
public final class SessionCookie {

    public static final String NAME = "dsa_session";

    private SessionCookie() {}

    public static ResponseCookie create(String token, Duration lifetime, boolean secure) {
        return builder(token, secure).maxAge(lifetime).build();
    }

    /** A cookie that is already expired, which makes the browser delete it. */
    public static ResponseCookie expired(boolean secure) {
        return builder("", secure).maxAge(0).build();
    }

    public static Optional<String> read(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();

        for (Cookie cookie : cookies) {
            if (NAME.equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return Optional.of(cookie.getValue());
            }
        }
        return Optional.empty();
    }

    private static ResponseCookie.ResponseCookieBuilder builder(String value, boolean secure) {
        return ResponseCookie.from(NAME, value)
                .httpOnly(true)     // page scripts can't read it
                .sameSite("Lax")    // not sent with other sites' POST requests
                .secure(secure)     // HTTPS only, when the site is served over HTTPS
                .path("/");
    }
}
