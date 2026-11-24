package com.team.edumarket.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "referrals")
public class Referral {

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_SUCCESSFUL = "SUCCESSFUL";
    public static final String STATUS_EXPIRED = "EXPIRED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "referral_id")
    private Long referralId;

    @Column(name = "referrer_id", nullable = false)
    private Long referrerId;

    @Column(name = "referred_id")
    private Long referredId;

    @Column(name = "referral_code", nullable = false, unique = true, length = 40)
    private String referralCode;

    @Column(name = "status", nullable = false, length = 15)
    private String status = STATUS_PENDING;

    @Column(name = "reward_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal rewardAmount = BigDecimal.ZERO;

    @Column(name = "referral_date", nullable = false)
    private LocalDate referralDate;

    @PrePersist
    void onCreate() {
        if (referralDate == null) {
            referralDate = LocalDate.now();
        }
    }

    public Long getReferralId() { return referralId; }
    public Long getReferrerId() { return referrerId; }
    public void setReferrerId(Long referrerId) { this.referrerId = referrerId; }
    public Long getReferredId() { return referredId; }
    public void setReferredId(Long referredId) { this.referredId = referredId; }
    public String getReferralCode() { return referralCode; }
    public void setReferralCode(String referralCode) { this.referralCode = referralCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getRewardAmount() { return rewardAmount; }
    public void setRewardAmount(BigDecimal rewardAmount) { this.rewardAmount = rewardAmount; }
    public LocalDate getReferralDate() { return referralDate; }
    public void setReferralDate(LocalDate referralDate) { this.referralDate = referralDate; }
}