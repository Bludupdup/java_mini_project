package com.codepath.platform.controller;

import com.codepath.platform.dto.LessonDto.LessonResponse;
import com.codepath.platform.entity.*;
import com.codepath.platform.repository.*;
import com.codepath.platform.service.LessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicRepository topicRepository;
    private final TopicVideoRepository videoRepository;
    private final PracticeProblemRepository problemRepository;
    private final LessonRepository lessonRepository;
    private final UserTopicProgressRepository progressRepository;
    private final PracticeAttemptRepository attemptRepository;
    private final LessonService lessonService;

    public TopicController(TopicRepository topicRepository,
                           TopicVideoRepository videoRepository,
                           PracticeProblemRepository problemRepository,
                           LessonRepository lessonRepository,
                           UserTopicProgressRepository progressRepository,
                           PracticeAttemptRepository attemptRepository,
                           LessonService lessonService) {
        this.topicRepository = topicRepository;
        this.videoRepository = videoRepository;
        this.problemRepository = problemRepository;
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
        this.attemptRepository = attemptRepository;
        this.lessonService = lessonService;
    }

    @GetMapping
    public ResponseEntity<?> getAllTopics(@AuthenticationPrincipal User user) {
        List<Topic> topics = topicRepository.findAllByOrderBySequenceNumberAsc();
        Long userId = user != null ? user.getId() : null;

        List<Map<String, Object>> response = new ArrayList<>();
        for (Topic t : topics) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("stageId", t.getStageId());
            map.put("stageName", t.getStageName());
            map.put("title", t.getTitle());
            map.put("description", t.getDescription());
            map.put("sequenceNumber", t.getSequenceNumber());
            map.put("slug", t.getSlug());
            map.put("hasCachedLesson", lessonRepository.existsByTopicId(t.getId()));

            if (userId != null) {
                var p = progressRepository.findByUserIdAndTopicId(userId, t.getId());
                map.put("progressStatus", p.map(UserTopicProgress::getStatus).orElse("NOT_STARTED"));
                map.put("theoryCompleted", p.map(UserTopicProgress::getTheoryCompleted).orElse(false));
                map.put("codeCompleted", p.map(UserTopicProgress::getCodeCompleted).orElse(false));
                map.put("practiceCompletedCount", p.map(UserTopicProgress::getPracticeCompletedCount).orElse(0));
            } else {
                map.put("progressStatus", "NOT_STARTED");
                map.put("theoryCompleted", false);
                map.put("codeCompleted", false);
                map.put("practiceCompletedCount", 0);
            }
            response.add(map);
        }

        return ResponseEntity.ok(Map.of("success", true, "total", response.size(), "data", response));
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<?> getTopicByIdOrSlug(@PathVariable String identifier, 
                                                @AuthenticationPrincipal User user) {
        Optional<Topic> topicOpt;
        if (identifier.matches("^\\d+$")) {
            topicOpt = topicRepository.findById(Long.parseLong(identifier));
        } else {
            topicOpt = topicRepository.findBySlug(identifier);
        }

        if (topicOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "error", "Topic not found: " + identifier));
        }

        Topic topic = topicOpt.get();
        Long userId = user != null ? user.getId() : null;

        List<TopicVideo> videos = videoRepository.findByTopicIdOrderBySequenceNumberAsc(topic.getId());
        List<PracticeProblem> problems = problemRepository.findByTopicId(topic.getId());

        List<Map<String, Object>> problemDtos = new ArrayList<>();
        for (PracticeProblem p : problems) {
            Map<String, Object> pMap = new HashMap<>();
            pMap.put("id", p.getId());
            pMap.put("title", p.getTitle());
            pMap.put("platform", p.getPlatform());
            pMap.put("externalUrl", p.getExternalUrl());
            pMap.put("difficulty", p.getDifficulty());
            pMap.put("problemType", p.getProblemType());

            if (userId != null) {
                var attempt = attemptRepository.findByUserIdAndPracticeProblemId(userId, p.getId());
                pMap.put("attemptStatus", attempt.map(PracticeAttempt::getAttemptStatus).orElse(null));
                pMap.put("verificationStatus", attempt.map(PracticeAttempt::getVerificationStatus).orElse(null));
                pMap.put("attemptedAt", attempt.map(PracticeAttempt::getAttemptedAt).orElse(null));
            } else {
                pMap.put("attemptStatus", null);
                pMap.put("verificationStatus", null);
                pMap.put("attemptedAt", null);
            }
            problemDtos.add(pMap);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", topic.getId());
        data.put("stageId", topic.getStageId());
        data.put("stageName", topic.getStageName());
        data.put("title", topic.getTitle());
        data.put("description", topic.getDescription());
        data.put("sequenceNumber", topic.getSequenceNumber());
        data.put("slug", topic.getSlug());
        data.put("videos", videos);
        data.put("practiceProblems", problemDtos);
        data.put("hasCachedLesson", lessonRepository.existsByTopicId(topic.getId()));

        if (userId != null) {
            var prog = progressRepository.findByUserIdAndTopicId(userId, topic.getId());
            data.put("progressStatus", prog.map(UserTopicProgress::getStatus).orElse("NOT_STARTED"));
            data.put("theoryCompleted", prog.map(UserTopicProgress::getTheoryCompleted).orElse(false));
            data.put("codeCompleted", prog.map(UserTopicProgress::getCodeCompleted).orElse(false));
            data.put("practiceCompletedCount", prog.map(UserTopicProgress::getPracticeCompletedCount).orElse(0));
        }

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/{topicId}/lesson")
    public ResponseEntity<?> getTopicLesson(@PathVariable Long topicId,
                                            @RequestParam(defaultValue = "false") boolean force) {
        LessonResponse lesson = lessonService.getOrCreateLesson(topicId, force);
        return ResponseEntity.ok(Map.of("success", true, "data", lesson));
    }

    @PostMapping("/{topicId}/lesson/generate")
    public ResponseEntity<?> forceGenerateLesson(@PathVariable Long topicId) {
        LessonResponse lesson = lessonService.getOrCreateLesson(topicId, true);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Lesson generated and cached in PostgreSQL successfully.",
            "data", lesson
        ));
    }
}
