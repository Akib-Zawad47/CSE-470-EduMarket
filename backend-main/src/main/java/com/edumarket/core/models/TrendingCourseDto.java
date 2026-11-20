package com.edumarket.core.models;

import java.math.BigDecimal;

public interface TrendingCourseDto {
    Long getCourseId();
    String getTitle();
    BigDecimal getPrice();
    Long getSearches7d();
    Long getPurchases7d();
    Long getTrendScore();
}