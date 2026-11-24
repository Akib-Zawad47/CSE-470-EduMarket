package com.team.edumarket.dto;

import java.math.BigDecimal;

public class CourseRecommendationDTO {
    private Long recommendationId;
    private Long courseId;
    private String title;
    private String description;
    private String level;
    private BigDecimal price;
    private Float score;

    public CourseRecommendationDTO(Long recommendationId, Long courseId, String title, String description, String level, BigDecimal price, Float score) {
        this.recommendationId = recommendationId;
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.level = level;
        this.price = price;
        this.score = score;
    }

    // Getters
    public Long getRecommendationId() { return recommendationId; }
    public Long getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLevel() { return level; }
    public BigDecimal getPrice() { return price; }
    public Float getScore() { return score; }
}