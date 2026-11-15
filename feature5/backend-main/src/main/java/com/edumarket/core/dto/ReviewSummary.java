package com.edumarket.core.dto;

import java.time.LocalDate;

public record ReviewSummary(
        String studentName,
        int rating,
        String comment,
        LocalDate reviewDate,
        String courseTitle) {
}
