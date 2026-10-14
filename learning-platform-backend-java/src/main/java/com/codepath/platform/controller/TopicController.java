package com.codepath.platform.controller;

import com.codepath.platform.dto.TopicDtos.TopicDto;
import com.codepath.platform.dto.TopicDtos.TopicListResponse;
import com.codepath.platform.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The topic catalog. Public: no login needed to read it. */
@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final CatalogService catalogService;

    public TopicController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public TopicListResponse getAllTopics() {
        return new TopicListResponse(catalogService.getAllTopics());
    }

    @GetMapping("/{slug}")
    public TopicDto getTopic(@PathVariable String slug) {
        return catalogService.getTopic(slug);
    }
}
