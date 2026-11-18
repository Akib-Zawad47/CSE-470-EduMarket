package com.edumarket.core.dto;

import java.time.LocalDateTime;

/** Short version used in the list of pages (no block details). */
public record LandingPageSummary(
        Long pageId,
        String title,
        String slug,
        Long courseId,
        Long instructorId,
        int blockCount,
        LocalDateTime createdAt) {
}
