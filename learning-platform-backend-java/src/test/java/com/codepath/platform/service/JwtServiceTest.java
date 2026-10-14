package com.codepath.platform.service;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(new byte[48]);

    @Test
    void readsBackTheUserIdFromItsOwnToken() {
        JwtService jwt = new JwtService(SECRET, Duration.ofDays(7));

        assertThat(jwt.readUserId(jwt.createToken(42L))).contains(42L);
    }

    @Test
    void rejectsTokensThatAreDamagedForgedOrExpired() {
        JwtService jwt = new JwtService(SECRET, Duration.ofDays(7));
        String token = jwt.createToken(42L);

        // Damaged: one character of the signature changed.
        String damaged = token.substring(0, token.length() - 2) + (token.endsWith("A") ? "BB" : "AA");
        assertThat(jwt.readUserId(damaged)).isEmpty();

        // Forged: signed with a different secret.
        JwtService other = new JwtService(Base64.getEncoder().encodeToString("x".repeat(48).getBytes()), Duration.ofDays(7));
        assertThat(jwt.readUserId(other.createToken(42L))).isEmpty();

        // Expired the moment it was made.
        JwtService instant = new JwtService(SECRET, Duration.ofSeconds(-1));
        assertThat(jwt.readUserId(instant.createToken(42L))).isEmpty();

        assertThat(jwt.readUserId("not a token")).isEmpty();
    }

    @Test
    void worksWithoutAConfiguredSecret() {
        JwtService jwt = new JwtService("", Duration.ofDays(7));

        assertThat(jwt.readUserId(jwt.createToken(7L))).contains(7L);
    }
}
