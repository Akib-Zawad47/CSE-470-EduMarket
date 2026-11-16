package com.edumarket.core.repositories;

import com.edumarket.core.models.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Optional<Promotion> findByCouponCodeIgnoreCase(String couponCode);

    // ACTIVE promotions of one course whose date range includes "today".
    @Query("SELECT p FROM Promotion p WHERE p.courseId = :courseId AND p.status = 'ACTIVE' "
            + "AND p.startDate <= :today AND p.expiryDate >= :today")
    List<Promotion> findActiveForCourse(@Param("courseId") Long courseId,
                                        @Param("today") LocalDate today);

    // How many times this student has already PAID using this promotion.
    @Query(value = "SELECT COUNT(*) FROM payments pay "
            + "JOIN enrollments e ON e.enrollment_id = pay.enrollment_id "
            + "WHERE pay.promotion_id = :promotionId AND e.student_id = :studentId "
            + "AND pay.payment_status = 'PAID'", nativeQuery = true)
    long countPaidUses(@Param("promotionId") Long promotionId,
                       @Param("studentId") Long studentId);
}