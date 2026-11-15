package com.edumarket.core.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record LandingPageResponse(
        Long pageId,
        String title,
        String slug,
        Long courseId,
        Long instructorId,
        List<Map<String, Object>> blocks,
        LocalDateTime createdAt) {
}
