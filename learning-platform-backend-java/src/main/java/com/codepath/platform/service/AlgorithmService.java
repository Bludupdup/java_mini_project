package com.codepath.platform.service;

import com.codepath.platform.dto.AlgorithmDtos.*;
import com.codepath.platform.entity.Algorithm;
import com.codepath.platform.entity.Topic;
import com.codepath.platform.exception.ApiException;
import com.codepath.platform.repository.AlgorithmRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Reads the algorithm library from the database. */
@Service
@Transactional(readOnly = true)
public class AlgorithmService {

    private final AlgorithmRepository algorithmRepository;

    public AlgorithmService(AlgorithmRepository algorithmRepository) {
        this.algorithmRepository = algorithmRepository;
    }

    public List<AlgorithmSummary> getAll() {
        return algorithmRepository.findAllWithTopic().stream()
                .map(algorithm -> new AlgorithmSummary(algorithm.getSlug(), algorithm.getName(),
                        topicRef(algorithm.getTopic()), algorithm.getDescription(), complexity(algorithm)))
                .toList();
    }

    public AlgorithmDetail get(String slug) {
        Algorithm a = algorithmRepository.findBySlugWithTopic(slug)
                .orElseThrow(() -> ApiException.notFound("There is no algorithm called \"" + slug + "\"."));

        LeetCodeDto leetcode = a.getLeetcodeUrl() == null
                ? null
                : new LeetCodeDto(a.getLeetcodeTitle(), a.getLeetcodeUrl(), a.getLeetcodeDifficulty());

        return new AlgorithmDetail(a.getSlug(), a.getName(), topicRef(a.getTopic()), a.getDescription(),
                a.getWorking(), a.getExample(), a.getCppCode(), a.getOutput(), a.getRecurrence(),
                complexity(a), a.getApplications(), a.getAdvantages(), a.getDisadvantages(),
                a.getYoutubeUrl(), leetcode);
    }

    private static TopicRef topicRef(Topic topic) {
        return topic == null ? null : new TopicRef(topic.getSlug(), topic.getTitle());
    }

    private static ComplexityDto complexity(Algorithm a) {
        return new ComplexityDto(a.getBestComplexity(), a.getAverageComplexity(),
                a.getWorstComplexity(), a.getSpaceComplexity());
    }
}
