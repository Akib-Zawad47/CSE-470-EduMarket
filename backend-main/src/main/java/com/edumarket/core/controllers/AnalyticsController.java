package com.edumarket.core.controllers;

import com.edumarket.core.models.CourseOptionDto;
import com.edumarket.core.models.FunnelEvent;
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

    @GetMapping("/courses")
    public ResponseEntity<List<CourseOptionDto>> getAllCourses() {
        return ResponseEntity.ok(analyticsService.getAllCourses());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<TrendingCourseDto>> getTrendingCourses() {
        return ResponseEntity.ok(analyticsService.getTrendingCourses());
    }

    @GetMapping("/funnel/{courseId}")
    public ResponseEntity<?> getCourseFunnel(@PathVariable Long courseId) {
        return ResponseEntity.ok(analyticsService.getCourseDropOffInsights(courseId));
    }

    @PostMapping("/events")
    public ResponseEntity<?> recordEvent(@RequestBody Map<String, Object> payload) {
        Long courseId = Long.valueOf(payload.get("courseId").toString());
        Long userId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : 3L;
        String eventType = payload.get("eventType").toString();
        FunnelEvent saved = analyticsService.recordFunnelEvent(userId, courseId, eventType);
        return ResponseEntity.ok(saved);
    }
}