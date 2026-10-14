package com.codepath.platform.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * An error to send to the client as { "error": message, "fields": {...} }.
 * fields holds per-field messages for forms, e.g. { "email": "Enter your email address." }.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final Map<String, String> fields;

    public ApiException(HttpStatus status, String message) {
        this(status, message, Map.of());
    }

    public ApiException(HttpStatus status, String message, Map<String, String> fields) {
        super(message);
        this.status = status;
        this.fields = fields;
    }

    public HttpStatus getStatus() { return status; }
    public Map<String, String> getFields() { return fields; }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
