package com.codepath.platform.repository;

import com.codepath.platform.entity.PracticeProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeProblemRepository extends JpaRepository<PracticeProblem, Long> {
    List<PracticeProblem> findByTopicId(Long topicId);
}
