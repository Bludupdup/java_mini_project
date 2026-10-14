package com.codepath.platform.service;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/** The same cases as the frontend's src/auth/authRules.test.js: both must agree. */
class AuthValidationTest {

    @Test
    void acceptsAValidRegistration() {
        assertThat(AuthValidation.validateRegistration("Sam", "sam@example.com", "correct horse")).isEmpty();
    }

    @Test
    void explainsEveryProblemWithARegistration() {
        assertThat(AuthValidation.validateRegistration(" ", "sam@", "short")).isEqualTo(Map.of(
                "name", "Enter your name.",
                "email", "Enter a valid email address, like sam@example.com.",
                "password", "Use at least 8 characters."));

        assertThat(AuthValidation.validateRegistration("Sam", "sam@example.com", "SAM@example.com"))
                .containsEntry("password", "Don't use your email address as your password.");

        assertThat(AuthValidation.validateRegistration("x".repeat(41), "sam@example.com", "correct horse"))
                .containsEntry("name", "Use at most 40 characters.");
    }

    @Test
    void copesWithMissingValues() {
        assertThat(AuthValidation.validateRegistration(null, null, null).keySet())
                .containsExactlyElementsOf(List.of("name", "email", "password"));
        assertThat(AuthValidation.validateLogin(null, null).keySet())
                .containsExactlyElementsOf(List.of("email", "password"));
    }

    @Test
    void treatsEmailsCaseInsensitively() {
        assertThat(AuthValidation.normalizeEmail("  Sam@Example.COM ")).isEqualTo("sam@example.com");
        assertThat(AuthValidation.validateLogin(" SAM@example.com ", "x")).isEmpty();
    }
}
