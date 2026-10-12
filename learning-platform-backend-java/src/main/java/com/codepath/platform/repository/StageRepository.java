package com.codepath.platform.repository;

import com.codepath.platform.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StageRepository extends JpaRepository<Stage, Long> {
    List<Stage> findAllByOrderBySequenceNumberAsc();
}
