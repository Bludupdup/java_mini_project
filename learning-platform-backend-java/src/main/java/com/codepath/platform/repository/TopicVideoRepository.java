package com.codepath.platform.repository;

import com.codepath.platform.entity.TopicVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicVideoRepository extends JpaRepository<TopicVideo, Long> {
    List<TopicVideo> findByTopicIdOrderBySequenceNumberAsc(Long topicId);
}
