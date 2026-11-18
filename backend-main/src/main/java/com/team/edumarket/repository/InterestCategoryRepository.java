package com.team.edumarket.repository;

import com.team.edumarket.model.InterestCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterestCategoryRepository extends JpaRepository<InterestCategory, Long> {
    @Query(value = "SELECT ic.* FROM interest_categories ic " +
                   "JOIN student_interests si ON ic.interest_id = si.interest_id " +
                   "WHERE si.student_id = :studentId", nativeQuery = true)
    List<InterestCategory> findInterestsByStudentId(@Param("studentId") Long studentId);
}