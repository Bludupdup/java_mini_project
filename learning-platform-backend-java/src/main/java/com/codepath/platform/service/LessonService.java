package com.codepath.platform.service;

import com.codepath.platform.dto.LessonDto.LessonResponse;
import com.codepath.platform.entity.Lesson;
import com.codepath.platform.entity.Topic;
import com.codepath.platform.repository.LessonRepository;
import com.codepath.platform.repository.TopicRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LessonService {

    private static final Logger log = LoggerFactory.getLogger(LessonService.class);

    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-flight concurrency lock to deduplicate parallel requests for the same topic
    private final ConcurrentHashMap<Long, Object> locks = new ConcurrentHashMap<>();

    public LessonService(LessonRepository lessonRepository, 
                         TopicRepository topicRepository, 
                         GeminiService geminiService) {
        this.lessonRepository = lessonRepository;
        this.topicRepository = topicRepository;
        this.geminiService = geminiService;
    }

    @Transactional
    public LessonResponse getOrCreateLesson(Long topicId, boolean forceRegenerate) {
        // 1. Check PostgreSQL cache first
        if (!forceRegenerate) {
            Optional<Lesson> cached = lessonRepository.findByTopicId(topicId);
            if (cached.isPresent()) {
                return mapToResponse(cached.get(), true, "DATABASE_CACHE");
            }
        }

        // 2. Concurrency lock to prevent duplicate concurrent LLM calls
        Object lock = locks.computeIfAbsent(topicId, k -> new Object());
        synchronized (lock) {
            try {
                // Re-check cache inside synchronized block
                if (!forceRegenerate) {
                    Optional<Lesson> rechecked = lessonRepository.findByTopicId(topicId);
                    if (rechecked.isPresent()) {
                        return mapToResponse(rechecked.get(), true, "DATABASE_CACHE");
                    }
                }

                Topic topic = topicRepository.findById(topicId)
                        .orElseThrow(() -> new IllegalArgumentException("Topic not found for ID: " + topicId));

                log.info("[LessonService] Cache miss for topic '{}' (ID: {}). Generating via LLM...", topic.getTitle(), topicId);

                Map<String, Object> generated = geminiService.generateLessonContent(topic);

                Lesson lesson = lessonRepository.findByTopicId(topicId).orElse(new Lesson());
                lesson.setTopic(topic);
                lesson.setTheory(String.valueOf(generated.getOrDefault("theory", "")));
                lesson.setAlgorithm(String.valueOf(generated.getOrDefault("algorithm", "")));
                lesson.setCodeExamples(toJsonString(generated.get("code_examples")));
                lesson.setTimeComplexity(toJsonString(generated.get("time_complexity")));
                lesson.setSpaceComplexity(String.valueOf(generated.getOrDefault("space_complexity", "O(1)")));
                lesson.setPracticeQuestions(toJsonString(generated.get("practice_questions")));
                lesson.setGeneratedAt(LocalDateTime.now());
                lesson.setContentVersion(lesson.getContentVersion() != null ? lesson.getContentVersion() + 1 : 1);

                Lesson saved = lessonRepository.save(lesson);
                log.info("[LessonService] Successfully saved and cached lesson for topic '{}' (ID: {})", topic.getTitle(), topicId);

                return mapToResponse(saved, false, "LLM_GENERATED_AND_CACHED");
            } finally {
                locks.remove(topicId);
            }
        }
    }

    private String toJsonString(Object obj) {
        if (obj == null) return "[]";
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    private LessonResponse mapToResponse(Lesson lesson, boolean isCached, String source) {
        LessonResponse res = new LessonResponse();
        res.setId(lesson.getId());
        res.setTopicId(lesson.getTopicId());
        res.setTheory(lesson.getTheory());
        res.setAlgorithm(lesson.getAlgorithm());
        res.setSpaceComplexity(lesson.getSpaceComplexity());
        res.setGeneratedAt(lesson.getGeneratedAt());
        res.setContentVersion(lesson.getContentVersion());
        res.setCached(isCached);
        res.setSource(source);

        try {
            res.setCodeExamples(objectMapper.readTree(lesson.getCodeExamples()));
            res.setTimeComplexity(objectMapper.readTree(lesson.getTimeComplexity()));
            res.setPracticeQuestions(objectMapper.readTree(lesson.getPracticeQuestions()));
        } catch (Exception e) {
            res.setCodeExamples(lesson.getCodeExamples());
            res.setTimeComplexity(lesson.getTimeComplexity());
            res.setPracticeQuestions(lesson.getPracticeQuestions());
        }

        return res;
    }
}
