package com.codepath.platform.dto;

import java.util.List;

/** JSON for /api/algorithms. "id" is the slug ("merge-sort"), as for topics. */
public class AlgorithmDtos {

    /** The topic an algorithm belongs to. */
    public record TopicRef(String id, String title) {}

    public record ComplexityDto(String best, String average, String worst, String space) {}

    public record LeetCodeDto(String title, String url, String difficulty) {}

    /** One row of the library list: enough to show and link it. */
    public record AlgorithmSummary(String id, String name, TopicRef topic, String description,
                                   ComplexityDto complexity) {}

    /** Everything about one algorithm. */
    public record AlgorithmDetail(
            String id,
            String name,
            TopicRef topic,
            String description,
            String working,
            String example,
            String cppCode,
            String output,
            String recurrence,
            ComplexityDto complexity,
            String applications,
            String advantages,
            String disadvantages,
            String youtubeUrl,
            LeetCodeDto leetcode) {}

    public record AlgorithmListResponse(List<AlgorithmSummary> algorithms) {}
}
