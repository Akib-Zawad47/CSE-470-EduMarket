package com.edumarket.core.dto;

import java.util.List;

/** Everything the public portfolio page needs, in one response. */
public record InstructorPortfolio(
        InstructorProfile instructor,
        List<CourseSummary> courses,
        List<ReviewSummary> recentReviews) {
}
