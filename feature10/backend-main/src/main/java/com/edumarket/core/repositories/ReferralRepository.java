package com.edumarket.core.repositories;

import com.edumarket.core.models.Referral;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReferralRepository extends JpaRepository<Referral, Long> {

    Optional<Referral> findByReferralCode(String referralCode);

    boolean existsByReferralCode(String referralCode);

    boolean existsByReferredId(Long referredId);

    Optional<Referral> findByReferredIdAndStatus(Long referredId, String status);

    List<Referral> findByReferrerIdOrderByReferralDateDesc(Long referrerId);
}