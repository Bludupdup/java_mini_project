package com.codepath.platform.service;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Account rules, the same as the frontend's src/auth/authRules.js. The forms
 * check them for instant feedback; this is the real check. If you change a
 * rule, change it in both files.
 * Each validate method returns { field: message }; empty means valid.
 */
public final class AuthValidation {

    public static final int NAME_MAX = 40;
    public static final int EMAIL_MAX = 254;
    public static final int PASSWORD_MIN = 8;
    public static final int PASSWORD_MAX = 128;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private AuthValidation() {}

    public static String normalizeEmail(String email) {
        return asText(email).trim().toLowerCase(Locale.ROOT);
    }

    public static Map<String, String> validateLogin(String email, String password) {
        Map<String, String> errors = new LinkedHashMap<>();
        String emailError = checkEmail(email);

        if (emailError != null) errors.put("email", emailError);
        if (asText(password).isEmpty()) errors.put("password", "Enter your password.");

        return errors;
    }

    public static Map<String, String> validateRegistration(String name, String email, String password) {
        Map<String, String> errors = new LinkedHashMap<>();
        String cleanName = asText(name).trim();
        String cleanPassword = asText(password);
        String emailError = checkEmail(email);

        if (cleanName.isEmpty()) errors.put("name", "Enter your name.");
        else if (cleanName.length() > NAME_MAX) errors.put("name", "Use at most " + NAME_MAX + " characters.");

        if (emailError != null) errors.put("email", emailError);

        if (cleanPassword.length() < PASSWORD_MIN) {
            errors.put("password", "Use at least " + PASSWORD_MIN + " characters.");
        } else if (cleanPassword.length() > PASSWORD_MAX) {
            errors.put("password", "Use at most " + PASSWORD_MAX + " characters.");
        } else if (cleanPassword.toLowerCase(Locale.ROOT).equals(normalizeEmail(email))) {
            errors.put("password", "Don't use your email address as your password.");
        }

        return errors;
    }

    private static String checkEmail(String email) {
        String value = normalizeEmail(email);

        if (value.isEmpty()) return "Enter your email address.";
        if (value.length() > EMAIL_MAX || !EMAIL_PATTERN.matcher(value).matches()) {
            return "Enter a valid email address, like sam@example.com.";
        }
        return null;
    }

    private static String asText(String value) {
        return value == null ? "" : value;
    }
}
