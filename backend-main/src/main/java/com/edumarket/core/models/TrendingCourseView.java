package com.edumarket.core.models;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "v_trending_courses")
public class TrendingCourseView {

    @Id
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "searches_7d")
    private Long searches7d;

    @Column(name = "purchases_7d")
    private Long purchases7d;

    public Long getCourseId() { return courseId; }
    public Long getSearches7d() { return searches7d; }
    public Long getPurchases7d() { return purchases7d; }
}