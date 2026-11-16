package com.edumarket.core.services;

import com.edumarket.core.models.Referral;
import com.edumarket.core.repositories.ReferralRepository;
import com.edumarket.core.repositories.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
public class ReferralService {

    // Points the inviter earns for one successful referral
    public static final int REWARD_POINTS = 50;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final ReferralRepository referralRepository;
    private final StudentRepository studentRepository;
    private final SecureRandom random = new SecureRandom();

    public ReferralService(ReferralRepository referralRepository,
                           StudentRepository studentRepository) {
        this.referralRepository = referralRepository;
        this.studentRepository = studentRepository;
    }

    // Rule 1: give the student an invite code (reuse the unused one if they already have it)
    @Transactional
    public Referral generateCode(Long studentId) {
        requireStudent(studentId);
        return referralRepository
                .findFirstByReferrerIdAndReferredIdIsNullAndStatus(studentId, Referral.STATUS_PENDING)
                .orElseGet(() -> {
                    Referral referral = new Referral();
                    referral.setReferrerId(studentId);
                    referral.setReferralCode(newUniqueCode());
                    return referralRepository.save(referral);
                });
    }

    // Rule 2: a new student uses someone's code
    @Transactional
    public Referral applyCode(String code, Long studentId) {
        requireStudent(studentId);

        Referral referral = referralRepository.findByReferralCode(code.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Referral code not found"));

        if (!Referral.STATUS_PENDING.equals(referral.getStatus()) || referral.getReferredId() != null) {
            throw new IllegalArgumentException("This referral code has already been used or has expired");
        }
        if (referral.getReferrerId().equals(studentId)) {
            throw new IllegalArgumentException("You cannot use your own referral code");
        }
        if (referralRepository.existsByReferredId(studentId)) {
            throw new IllegalArgumentException("You have already used a referral code");
        }
        if (referralRepository.countPaidPayments(studentId) > 0) {
            throw new IllegalArgumentException("Referral codes are only for students who have not bought a course yet");
        }

        referral.setReferredId(studentId);
        return referralRepository.save(referral);
    }

    // Rule 3: after the referred student's first PAID purchase, reward the inviter (only once)
    @Transactional
    public Optional<Referral> completeReferral(Long studentId) {
        Optional<Referral> pending =
                referralRepository.findByReferredIdAndStatus(studentId, Referral.STATUS_PENDING);

        if (pending.isEmpty() || referralRepository.countPaidPayments(studentId) == 0) {
            return Optional.empty();   // nothing to complete (yet)
        }

        Referral referral = pending.get();
        referral.setStatus(Referral.STATUS_SUCCESSFUL);
        referral.setRewardAmount(BigDecimal.valueOf(REWARD_POINTS));
        referralRepository.saveAndFlush(referral);

        studentRepository.addPoints(referral.getReferrerId(), REWARD_POINTS);
        return Optional.of(referral);
    }

    public List<Referral> findMine(Long studentId) {
        requireStudent(studentId);
        return referralRepository.findByReferrerIdOrderByReferralDateDesc(studentId);
    }

    // ---------- helpers ----------

    private void requireStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new IllegalArgumentException("Student not found");
        }
    }

    private String newUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("REF");
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (referralRepository.existsByReferralCode(code));
        return code;
    }
}