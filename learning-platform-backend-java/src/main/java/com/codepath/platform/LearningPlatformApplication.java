package com.codepath.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LearningPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(LearningPlatformApplication.class, args);
        System.out.println("=======================================================");
        System.out.println("  Spring Boot DSA Learning Platform Backend Started!  ");
        System.out.println("  Server Port: 8080                                    ");
        System.out.println("  API Base URL: http://localhost:8080/api              ");
        System.out.println("=======================================================");
    }
}
