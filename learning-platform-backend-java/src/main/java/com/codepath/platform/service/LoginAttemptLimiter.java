package com.codepath.platform.service;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * After 5 wrong passwords for one email, that email has to wait 15 minutes.
 * This stops scripts from guessing passwords quickly. It is kept in memory, so
 * a server restart clears it; that's fine for one server.
 */
@Component
public class LoginAttemptLimiter {

    static final int MAX_FAILURES = 5;
    static final Duration LOCKOUT = Duration.ofMinutes(15);

    private record Failures(int count, Instant since) {}

    private final Map<String, Failures> failures = new ConcurrentHashMap<>();
    private final Clock clock;

    public LoginAttemptLimiter() {
        this(Clock.systemUTC());
    }

    LoginAttemptLimiter(Clock clock) {
        this.clock = clock;
    }

    public boolean isLockedOut(String email) {
        Failures record = failures.get(email);

        if (record != null && record.since().plus(LOCKOUT).isBefore(clock.instant())) {
            failures.remove(email, record);
            return false;
        }
        return record != null && record.count() >= MAX_FAILURES;
    }

    public void recordFailure(String email) {
        failures.merge(email, new Failures(1, clock.instant()),
                (old, ignored) -> new Failures(old.count() + 1, old.since()));
    }

    public void reset(String email) {
        failures.remove(email);
    }
}
