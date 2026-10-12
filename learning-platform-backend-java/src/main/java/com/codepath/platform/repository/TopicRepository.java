package com.codepath.platform.repository;

import com.codepath.platform.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findAllByOrderBySequenceNumberAsc();
    Optional<Topic> findBySlug(String slug);
    List<Topic> findByStageIdOrderBySequenceNumberAsc(Long stageId);
}
