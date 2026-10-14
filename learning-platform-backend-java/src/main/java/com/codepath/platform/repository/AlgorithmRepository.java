package com.codepath.platform.repository;

import com.codepath.platform.entity.Algorithm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AlgorithmRepository extends JpaRepository<Algorithm, Long> {

    // LEFT JOIN FETCH loads each algorithm's topic in the same query (we need its slug and title).
    @Query("SELECT a FROM Algorithm a LEFT JOIN FETCH a.topic ORDER BY a.displayOrder")
    List<Algorithm> findAllWithTopic();

    @Query("SELECT a FROM Algorithm a LEFT JOIN FETCH a.topic WHERE a.slug = :slug")
    Optional<Algorithm> findBySlugWithTopic(String slug);
}
