package com.codepath.platform.controller;

import com.codepath.platform.entity.Stage;
import com.codepath.platform.entity.Topic;
import com.codepath.platform.entity.User;
import com.codepath.platform.repository.StageRepository;
import com.codepath.platform.repository.TopicRepository;
import com.codepath.platform.repository.UserTopicProgressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/stages")
public class StageController {

    private final StageRepository stageRepository;
    private final TopicRepository topicRepository;
    private final UserTopicProgressRepository progressRepository;

    public StageController(StageRepository stageRepository,
                           TopicRepository topicRepository,
                           UserTopicProgressRepository progressRepository) {
        this.stageRepository = stageRepository;
        this.topicRepository = topicRepository;
        this.progressRepository = progressRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllStages(@AuthenticationPrincipal User user) {
        List<Stage> stages = stageRepository.findAllByOrderBySequenceNumberAsc();
        Long userId = user != null ? user.getId() : null;

        List<Map<String, Object>> response = new ArrayList<>();

        for (Stage stage : stages) {
            List<Topic> topics = topicRepository.findByStageIdOrderBySequenceNumberAsc(stage.getId());
            int completedCount = 0;

            List<Map<String, Object>> topicDtos = new ArrayList<>();
            for (Topic t : topics) {
                Map<String, Object> tMap = new HashMap<>();
                tMap.put("id", t.getId());
                tMap.put("stageId", stage.getId());
                tMap.put("title", t.getTitle());
                tMap.put("description", t.getDescription());
                tMap.put("sequenceNumber", t.getSequenceNumber());
                tMap.put("slug", t.getSlug());

                if (userId != null) {
                    var p = progressRepository.findByUserIdAndTopicId(userId, t.getId());
                    if (p.isPresent()) {
                        tMap.put("theoryCompleted", p.get().getTheoryCompleted());
                        tMap.put("codeCompleted", p.get().getCodeCompleted());
                        tMap.put("practiceCompletedCount", p.get().getPracticeCompletedCount());
                        tMap.put("progressStatus", p.get().getStatus());
                        if ("COMPLETED".equals(p.get().getStatus())) {
                            completedCount++;
                        }
                    } else {
                        tMap.put("theoryCompleted", false);
                        tMap.put("codeCompleted", false);
                        tMap.put("practiceCompletedCount", 0);
                        tMap.put("progressStatus", "NOT_STARTED");
                    }
                } else {
                    tMap.put("theoryCompleted", false);
                    tMap.put("codeCompleted", false);
                    tMap.put("practiceCompletedCount", 0);
                    tMap.put("progressStatus", "NOT_STARTED");
                }

                topicDtos.add(tMap);
            }

            int percent = topics.isEmpty() ? 0 : (int) Math.round(((double) completedCount / topics.size()) * 100);

            Map<String, Object> stageMap = new HashMap<>();
            stageMap.put("id", stage.getId());
            stageMap.put("name", stage.getName());
            stageMap.put("description", stage.getDescription());
            stageMap.put("sequenceNumber", stage.getSequenceNumber());
            stageMap.put("topics", topicDtos);
            stageMap.put("totalTopics", topics.size());
            stageMap.put("completedTopics", completedCount);
            stageMap.put("progressPercentage", percent);

            response.add(stageMap);
        }

        return ResponseEntity.ok(Map.of("success", true, "data", response));
    }
}
