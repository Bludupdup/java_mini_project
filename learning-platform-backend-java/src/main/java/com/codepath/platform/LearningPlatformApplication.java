package com.codepath.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// Users log in with our own JWT filter, so Spring's default in-memory user
// (and its "generated security password" log line) is switched off.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class LearningPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(LearningPlatformApplication.class, args);
    }
}
