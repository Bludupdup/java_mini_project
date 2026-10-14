package com.codepath.platform.service;

import com.codepath.platform.dto.AuthDtos.LoginRequest;
import com.codepath.platform.dto.AuthDtos.RegisterRequest;
import com.codepath.platform.dto.AuthDtos.UserDto;
import com.codepath.platform.entity.User;
import com.codepath.platform.exception.ApiException;
import com.codepath.platform.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

    private static final String WRONG_LOGIN = "That email and password don't match.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptLimiter limiter;

    // Checked when the email is unknown, so that takes as long as a wrong
    // password and nobody can time the answer to find out who has an account.
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, LoginAttemptLimiter limiter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.limiter = limiter;
        this.dummyHash = passwordEncoder.encode("not-a-real-password");
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        Map<String, String> errors = AuthValidation.validateRegistration(
                request.name(), request.email(), request.password());
        if (!errors.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please fix the highlighted fields.", errors);
        }

        String email = AuthValidation.normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            String message = "An account with this email already exists. Try logging in.";
            throw new ApiException(HttpStatus.CONFLICT, message, Map.of("email", message));
        }

        User user = new User(request.name().trim(), email, passwordEncoder.encode(request.password()));
        return toDto(userRepository.save(user));
    }

    public UserDto login(LoginRequest request) {
        Map<String, String> errors = AuthValidation.validateLogin(request.email(), request.password());
        if (!errors.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please fix the highlighted fields.", errors);
        }

        String email = AuthValidation.normalizeEmail(request.email());
        if (limiter.isLockedOut(email)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many wrong passwords. Wait 15 minutes, then try again.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        String hash = user != null ? user.getPasswordHash() : dummyHash;
        boolean matches = passwordEncoder.matches(request.password(), hash);

        if (user == null || !matches) {
            limiter.recordFailure(email);
            // Same message either way, so nobody can find out which emails have accounts.
            throw new ApiException(HttpStatus.UNAUTHORIZED, WRONG_LOGIN);
        }

        limiter.reset(email);
        return toDto(user);
    }

    public static UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail());
    }
}
