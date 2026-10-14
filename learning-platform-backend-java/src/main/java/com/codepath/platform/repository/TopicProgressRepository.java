package com.codepath.platform.repository;

import com.codepath.platform.entity.TopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TopicProgressRepository extends JpaRepository<TopicProgress, Long> {

    // JOIN FETCH loads each row's topic in the same query (we need its slug).
    @Query("SELECT p FROM TopicProgress p JOIN FETCH p.topic WHERE p.userId = :userId")
    List<TopicProgress> findAllForUser(Long userId);

    Optional<TopicProgress> findByUserIdAndTopicId(Long userId, Long topicId);

    @Modifying
    @Query("DELETE FROM TopicProgress p WHERE p.userId = :userId")
    void deleteAllForUser(Long userId);
}
