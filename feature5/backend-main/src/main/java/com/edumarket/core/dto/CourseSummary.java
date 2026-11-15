package com.edumarket.core.dto;

import java.math.BigDecimal;

public record CourseSummary(
        long courseId,
        String title,
        String description,
        String level,
        BigDecimal price,
        double avgRating,
        int reviewCount,
        int studentCount) {
}
