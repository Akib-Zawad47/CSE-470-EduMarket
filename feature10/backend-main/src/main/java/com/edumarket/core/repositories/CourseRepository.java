package com.edumarket.core.repositories;

import com.edumarket.core.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}