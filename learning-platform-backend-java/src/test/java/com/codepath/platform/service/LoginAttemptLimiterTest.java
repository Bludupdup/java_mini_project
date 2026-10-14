package com.codepath.platform.service;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class LoginAttemptLimiterTest {

    /** A clock the test can move forward by hand. */
    private static class TestClock extends Clock {
        private Instant now = Instant.parse("2026-10-14T10:00:00Z");

        void advance(Duration duration) { now = now.plus(duration); }

        @Override public Instant instant() { return now; }
        @Override public ZoneOffset getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
    }

    @Test
    void locksAnEmailAfterFiveWrongPasswordsForFifteenMinutes() {
        TestClock clock = new TestClock();
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(clock);

        for (int i = 0; i < LoginAttemptLimiter.MAX_FAILURES - 1; i++) limiter.recordFailure("sam@example.com");
        assertThat(limiter.isLockedOut("sam@example.com")).isFalse();

        limiter.recordFailure("sam@example.com");
        assertThat(limiter.isLockedOut("sam@example.com")).isTrue();
        assertThat(limiter.isLockedOut("someone-else@example.com")).isFalse();

        clock.advance(LoginAttemptLimiter.LOCKOUT.plusSeconds(1));
        assertThat(limiter.isLockedOut("sam@example.com")).isFalse();
    }

    @Test
    void aSuccessfulLoginStartsTheCountAgain() {
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(new TestClock());

        for (int i = 0; i < 4; i++) limiter.recordFailure("sam@example.com");
        limiter.reset("sam@example.com");
        limiter.recordFailure("sam@example.com");

        assertThat(limiter.isLockedOut("sam@example.com")).isFalse();
    }
}
