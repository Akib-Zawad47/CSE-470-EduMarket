package com.edumarket.core.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/**
 * Read-only view of the existing "courses" table.
 * Feature 10 only needs the id, title and price to work out discounts.
 */
@Entity
@Immutable
@Table(name = "courses")
public class Course {

    @Id
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "title")
    private String title;

    @Column(name = "price")
    private BigDecimal price;

    public Long getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public BigDecimal getPrice() { return price; }
}