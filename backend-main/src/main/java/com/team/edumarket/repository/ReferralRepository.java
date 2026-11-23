package com.team.edumarket.repository;

import com.team.edumarket.model.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReferralRepository extends JpaRepository<Referral, Long> {

    Optional<Referral> findByReferralCode(String referralCode);

    boolean existsByReferralCode(String referralCode);

    boolean existsByReferredId(Long referredId);

    Optional<Referral> findByReferredIdAndStatus(Long referredId, String status);

    List<Referral> findByReferrerIdOrderByReferralDateDesc(Long referrerId);

    Optional<Referral> findFirstByReferrerIdAndReferredIdIsNullAndStatus(Long referrerId, String status);

    @Query(value = "SELECT COUNT(*) FROM payments pay "
            + "JOIN enrollments e ON e.enrollment_id = pay.enrollment_id "
            + "WHERE e.student_id = :studentId AND pay.payment_status = 'PAID'", nativeQuery = true)
    long countPaidPayments(@Param("studentId") Long studentId);
}