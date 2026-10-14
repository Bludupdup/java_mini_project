package com.codepath.platform.service;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/**
 * Login tokens. A JWT is a small signed note saying "this is user 42 until
 * <expiry>". Only this server knows the secret key, so nobody can forge or
 * edit one, and the server doesn't need to remember who is logged in.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final SecretKey key;
    private final Duration lifetime;

    public JwtService(@Value("${app.jwt.secret:}") String secret,
                      @Value("${app.jwt.lifetime:7d}") Duration lifetime) {
        this.key = secret.isBlank() ? randomKey() : Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.lifetime = lifetime;
    }

    private static SecretKey randomKey() {
        log.warn("JWT_SECRET is not set, so a random key is used: everyone is logged out when the server restarts.");
        return Jwts.SIG.HS256.key().build();
    }

    public Duration getLifetime() {
        return lifetime;
    }

    public String createToken(Long userId) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(lifetime)))
                .signWith(key)
                .compact();
    }

    /** The user id inside a valid token; empty if it's forged, damaged or expired. */
    public Optional<Long> readUserId(String token) {
        try {
            String subject = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return Optional.of(Long.valueOf(subject));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
