package com.codepath.platform.repository;

import com.codepath.platform.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    Optional<Lesson> findByTopicId(Long topicId);
    boolean existsByTopicId(Long topicId);
}
