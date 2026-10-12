package com.codepath.platform.service;

import com.codepath.platform.dto.ProgressDtos.*;
import com.codepath.platform.entity.*;
import com.codepath.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ProgressService {

    private final UserTopicProgressRepository progressRepository;
    private final PracticeAttemptRepository attemptRepository;
    private final TopicRepository topicRepository;
    private final PracticeProblemRepository problemRepository;

    public ProgressService(UserTopicProgressRepository progressRepository,
                           PracticeAttemptRepository attemptRepository,
                           TopicRepository topicRepository,
                           PracticeProblemRepository problemRepository) {
        this.progressRepository = progressRepository;
        this.attemptRepository = attemptRepository;
        this.topicRepository = topicRepository;
        this.problemRepository = problemRepository;
    }

    @Transactional
    public UserTopicProgress updateTopicProgress(User user, UpdateProgressRequest req) {
        Topic topic = topicRepository.findById(req.getTopicId())
                .orElseThrow(() -> new IllegalArgumentException("Topic not found for ID: " + req.getTopicId()));

        UserTopicProgress progress = progressRepository.findByUserIdAndTopicId(user.getId(), topic.getId())
                .orElse(new UserTopicProgress(user, topic));

        if (req.getTheoryCompleted() != null) {
            progress.setTheoryCompleted(req.getTheoryCompleted());
        }
        if (req.getCodeCompleted() != null) {
            progress.setCodeCompleted(req.getCodeCompleted());
        }

        if (req.getStatus() != null) {
            progress.setStatus(req.getStatus());
        } else {
            if (Boolean.TRUE.equals(progress.getTheoryCompleted()) && Boolean.TRUE.equals(progress.getCodeCompleted())) {
                progress.setStatus("COMPLETED");
            } else if (Boolean.TRUE.equals(progress.getTheoryCompleted()) || Boolean.TRUE.equals(progress.getCodeCompleted())) {
                progress.setStatus("IN_PROGRESS");
            }
        }

        progress.setUpdatedAt(LocalDateTime.now());
        return progressRepository.save(progress);
    }

    @Transactional
    public PracticeAttempt recordPracticeAttempt(User user, RecordAttemptRequest req) {
        PracticeProblem problem = problemRepository.findById(req.getPracticeProblemId())
                .orElseThrow(() -> new IllegalArgumentException("Problem not found for ID: " + req.getPracticeProblemId()));

        PracticeAttempt attempt = attemptRepository.findByUserIdAndPracticeProblemId(user.getId(), problem.getId())
                .orElse(new PracticeAttempt());

        attempt.setUser(user);
        attempt.setPracticeProblem(problem);
        attempt.setAttemptStatus(req.getAttemptStatus());
        attempt.setVerificationStatus(req.getVerificationStatus() != null ? req.getVerificationStatus() : "SELF_REPORTED");
        attempt.setNotes(req.getNotes());
        attempt.setAttemptedAt(LocalDateTime.now());

        PracticeAttempt saved = attemptRepository.save(attempt);

        // Update topic progress solved count
        long solvedCount = attemptRepository.countSolvedByUserIdAndTopicId(user.getId(), problem.getTopicId());
        UserTopicProgress progress = progressRepository.findByUserIdAndTopicId(user.getId(), problem.getTopicId())
                .orElse(new UserTopicProgress(user, problem.getTopic()));
        progress.setPracticeCompletedCount((int) solvedCount);
        if (!"COMPLETED".equals(progress.getStatus())) {
            progress.setStatus("IN_PROGRESS");
        }
        progress.setUpdatedAt(LocalDateTime.now());
        progressRepository.save(progress);

        return saved;
    }

    public DashboardSummaryDto getDashboardSummary(User user) {
        long totalTopics = topicRepository.count();
        long completedTopics = progressRepository.countByUserIdAndStatus(user.getId(), "COMPLETED");
        long inProgressTopics = progressRepository.countByUserIdAndStatus(user.getId(), "IN_PROGRESS");
        long notStartedTopics = Math.max(0, totalTopics - completedTopics - inProgressTopics);

        int overallPercentage = totalTopics > 0 ? (int) Math.round(((double) completedTopics / totalTopics) * 100) : 0;

        long totalSolved = attemptRepository.countTotalSolvedByUserId(user.getId());
        long verifiedSolved = attemptRepository.countVerifiedSolvedByUserId(user.getId());
        long selfReportedSolved = attemptRepository.countSelfReportedSolvedByUserId(user.getId());

        DashboardSummaryDto dto = new DashboardSummaryDto();
        dto.setTotalTopics(totalTopics);
        dto.setCompletedTopics(completedTopics);
        dto.setInProgressTopics(inProgressTopics);
        dto.setNotStartedTopics(notStartedTopics);
        dto.setOverallPercentage(overallPercentage);
        dto.setPracticeStats(new PracticeStatsDto(totalSolved, verifiedSolved, selfReportedSolved));

        // Find continue learning recommendation:
        // First in-progress topic, or lowest sequence uncompleted topic
        List<Topic> allTopics = topicRepository.findAllByOrderBySequenceNumberAsc();
        Topic continueTopic = null;
        for (Topic t : allTopics) {
            var p = progressRepository.findByUserIdAndTopicId(user.getId(), t.getId());
            if (p.isPresent() && "IN_PROGRESS".equals(p.get().getStatus())) {
                continueTopic = t;
                break;
            }
        }
        if (continueTopic == null) {
            for (Topic t : allTopics) {
                var p = progressRepository.findByUserIdAndTopicId(user.getId(), t.getId());
                if (p.isEmpty() || !"COMPLETED".equals(p.get().getStatus())) {
                    continueTopic = t;
                    break;
                }
            }
        }

        if (continueTopic != null) {
            dto.setContinueLearning(Map.of(
                "id", continueTopic.getId(),
                "title", continueTopic.getTitle(),
                "slug", continueTopic.getSlug(),
                "sequenceNumber", continueTopic.getSequenceNumber(),
                "stageName", continueTopic.getStageName() != null ? continueTopic.getStageName() : ""
            ));
        }

        return dto;
    }
}
