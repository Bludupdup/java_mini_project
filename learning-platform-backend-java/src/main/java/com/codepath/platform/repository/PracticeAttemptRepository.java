package com.codepath.platform.repository;

import com.codepath.platform.entity.PracticeAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PracticeAttemptRepository extends JpaRepository<PracticeAttempt, Long> {
    List<PracticeAttempt> findByUserId(Long userId);
    Optional<PracticeAttempt> findByUserIdAndPracticeProblemId(Long userId, Long practiceProblemId);

    @Query("SELECT COUNT(DISTINCT pa.practiceProblem.id) FROM PracticeAttempt pa " +
           "WHERE pa.user.id = :userId AND pa.practiceProblem.topic.id = :topicId AND pa.attemptStatus = 'SOLVED'")
    long countSolvedByUserIdAndTopicId(@Param("userId") Long userId, @Param("topicId") Long topicId);

    @Query("SELECT COUNT(DISTINCT pa.practiceProblem.id) FROM PracticeAttempt pa " +
           "WHERE pa.user.id = :userId AND pa.attemptStatus = 'SOLVED'")
    long countTotalSolvedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT pa.practiceProblem.id) FROM PracticeAttempt pa " +
           "WHERE pa.user.id = :userId AND pa.attemptStatus = 'SOLVED' AND pa.verificationStatus = 'VERIFIED'")
    long countVerifiedSolvedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT pa.practiceProblem.id) FROM PracticeAttempt pa " +
           "WHERE pa.user.id = :userId AND pa.attemptStatus = 'SOLVED' AND pa.verificationStatus = 'SELF_REPORTED'")
    long countSelfReportedSolvedByUserId(@Param("userId") Long userId);
}
