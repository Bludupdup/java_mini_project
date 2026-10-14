package com.codepath.platform.service;

import com.codepath.platform.dto.TopicDtos.AlgorithmLink;
import com.codepath.platform.dto.TopicDtos.ComplexityDto;
import com.codepath.platform.dto.TopicDtos.ProblemDto;
import com.codepath.platform.dto.TopicDtos.ResourceDto;
import com.codepath.platform.dto.TopicDtos.TopicDto;
import com.codepath.platform.entity.Topic;
import com.codepath.platform.exception.ApiException;
import com.codepath.platform.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Reads topics, with their lesson content and problems, from the database. */
@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final TopicRepository topicRepository;

    public CatalogService(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    public List<TopicDto> getAllTopics() {
        return topicRepository.findAllByOrderBySortOrderAsc().stream().map(CatalogService::toDto).toList();
    }

    public TopicDto getTopic(String slug) {
        return topicRepository.findBySlug(slug)
                .map(CatalogService::toDto)
                .orElseThrow(() -> ApiException.notFound("There is no topic called \"" + slug + "\"."));
    }

    // Runs inside the transaction, so the lazy lists can still be loaded.
    private static TopicDto toDto(Topic topic) {
        return new TopicDto(
                topic.getSlug(),
                topic.getTitle(),
                topic.getCategory(),
                topic.getDescription(),
                topic.getLevel(),
                topic.getLessonCount(),
                List.copyOf(topic.getStructures()),
                topic.getReadTime(),
                topic.getIcon(),
                topic.getColor(),
                topic.getTheory(),
                topic.getTip(),
                List.copyOf(topic.getSteps()),
                topic.getComplexity().stream()
                        .map(row -> new ComplexityDto(row.getLabel(), row.getValue(), row.getNote()))
                        .toList(),
                topic.getPseudocode(),
                topic.getResources().stream()
                        .map(link -> new ResourceDto(link.getTitle(), link.getSource(), link.getUrl()))
                        .toList(),
                topic.getProblems().stream()
                        .map(problem -> new ProblemDto(problem.getSlug(), problem.getTitle(),
                                problem.getPlatform(), problem.getDifficulty(), problem.getUrl()))
                        .toList(),
                topic.getAlgorithms().stream()
                        .map(algorithm -> new AlgorithmLink(algorithm.getSlug(), algorithm.getName()))
                        .toList());
    }
}
