package com.codepath.platform.config;

/**
 * The logged-in user making the current request. Controllers receive it with
 * {@code @AuthenticationPrincipal AuthenticatedUser user}.
 */
public record AuthenticatedUser(Long id, String name, String email) {}
