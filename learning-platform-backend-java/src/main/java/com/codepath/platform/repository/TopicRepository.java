package com.codepath.platform.repository;

import com.codepath.platform.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findAllByOrderBySortOrderAsc();
    Optional<Topic> findBySlug(String slug);
}
