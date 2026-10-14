package com.codepath.platform.dto;

import java.util.List;

/**
 * JSON for /api/topics, in the shape the React app already used for its
 * topics: "id" is the slug ("arrays"), and the icon is a lucide-react name.
 */
public class TopicDtos {

    public record TopicDto(
            String id,
            String title,
            String category,
            String description,
            String level,
            int lessons,
            List<String> structures,
            String readTime,
            String icon,
            String color,
            String theory,
            String tip,
            List<String> steps,
            List<ComplexityDto> complexity,
            String pseudocode,
            List<ResourceDto> resources,
            List<ProblemDto> problems,
            List<AlgorithmLink> algorithms) {}

    public record ComplexityDto(String label, String value, String note) {}

    public record ResourceDto(String title, String source, String url) {}

    public record ProblemDto(String id, String title, String platform, String difficulty, String url) {}

    /** An algorithm from the library that belongs to the topic: /algorithms/{id}. */
    public record AlgorithmLink(String id, String name) {}

    public record TopicListResponse(List<TopicDto> topics) {}
}
