package com.codepath.platform.repository;

import com.codepath.platform.entity.PracticeProblem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PracticeProblemRepository extends JpaRepository<PracticeProblem, Long> {
    Optional<PracticeProblem> findBySlug(String slug);
}
