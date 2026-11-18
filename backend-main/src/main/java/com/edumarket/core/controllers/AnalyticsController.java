package com.edumarket.core.controllers;

import com.edumarket.core.models.TrendingCourseDto;
import com.edumarket.core.services.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/trending")
    public ResponseEntity<List<TrendingCourseDto>> getTrendingCourses() {
        return ResponseEntity.ok(analyticsService.getTrendingCourses());
    }

    @GetMapping("/funnel/{courseId}")
    public ResponseEntity<?> getCourseFunnel(@PathVariable Long courseId) {
        return ResponseEntity.ok(analyticsService.getCourseDropOffInsights(courseId));
    }
}