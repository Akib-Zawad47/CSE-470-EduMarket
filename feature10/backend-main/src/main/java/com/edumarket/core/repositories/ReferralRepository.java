package com.edumarket.core.repositories;

import com.edumarket.core.models.Referral;
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

    // An invite code of this student that nobody has used yet
    Optional<Referral> findFirstByReferrerIdAndReferredIdIsNullAndStatus(Long referrerId, String status);

    // How many PAID payments this student has made
    @Query(value = "SELECT COUNT(*) FROM payments pay "
            + "JOIN enrollments e ON e.enrollment_id = pay.enrollment_id "
            + "WHERE e.student_id = :studentId AND pay.payment_status = 'PAID'", nativeQuery = true)
    long countPaidPayments(@Param("studentId") Long studentId);
}