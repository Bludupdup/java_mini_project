package com.codepath.platform.repository;

import com.codepath.platform.entity.ProblemProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProblemProgressRepository extends JpaRepository<ProblemProgress, Long> {

    @Query("SELECT p FROM ProblemProgress p JOIN FETCH p.problem WHERE p.userId = :userId")
    List<ProblemProgress> findAllForUser(Long userId);

    Optional<ProblemProgress> findByUserIdAndProblemId(Long userId, Long problemId);

    /** "Reset progress": forget solved marks but keep the notes. */
    @Modifying
    @Query("UPDATE ProblemProgress p SET p.solvedAt = NULL WHERE p.userId = :userId")
    void clearSolvedForUser(Long userId);

    @Modifying
    @Query("DELETE FROM ProblemProgress p WHERE p.userId = :userId AND p.note IS NULL")
    void deleteWithoutNoteForUser(Long userId);

    @Modifying
    @Query("DELETE FROM ProblemProgress p WHERE p.userId = :userId")
    void deleteAllForUser(Long userId);
}
