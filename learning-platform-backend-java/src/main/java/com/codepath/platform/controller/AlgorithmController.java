package com.codepath.platform.controller;

import com.codepath.platform.dto.AlgorithmDtos.AlgorithmDetail;
import com.codepath.platform.dto.AlgorithmDtos.AlgorithmListResponse;
import com.codepath.platform.service.AlgorithmService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The algorithm library. Public: no login needed to read it. */
@RestController
@RequestMapping("/api/algorithms")
public class AlgorithmController {

    private final AlgorithmService algorithmService;

    public AlgorithmController(AlgorithmService algorithmService) {
        this.algorithmService = algorithmService;
    }

    @GetMapping
    public AlgorithmListResponse getAll() {
        return new AlgorithmListResponse(algorithmService.getAll());
    }

    @GetMapping("/{slug}")
    public AlgorithmDetail get(@PathVariable String slug) {
        return algorithmService.get(slug);
    }
}
