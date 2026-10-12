package com.codepath.platform.repository;

import com.codepath.platform.entity.UserTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTopicProgressRepository extends JpaRepository<UserTopicProgress, Long> {
    Optional<UserTopicProgress> findByUserIdAndTopicId(Long userId, Long topicId);
    List<UserTopicProgress> findByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
}
