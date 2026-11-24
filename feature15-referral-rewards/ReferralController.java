package com.team.edumarket.controller;

import com.team.edumarket.model.Referral;
import com.team.edumarket.service.ReferralService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/referrals")
public class ReferralController {

    private final ReferralService referralService;

    public ReferralController(ReferralService referralService) {
        this.referralService = referralService;
    }

    @PostMapping("/generate")
    public Referral generate(@RequestParam Long studentId) {
        return referralService.generateCode(studentId);
    }

    @PostMapping("/apply")
    public Referral apply(@RequestParam String code, @RequestParam Long studentId) {
        return referralService.applyCode(code, studentId);
    }

    @PostMapping("/complete")
    public Object complete(@RequestParam Long studentId) {
        Optional<Referral> done = referralService.completeReferral(studentId);
        if (done.isPresent()) {
            return done.get();
        }
        return Map.of("message", "Nothing to complete: no pending referral, or no paid purchase yet");
    }

    @GetMapping("/mine")
    public List<Referral> mine(@RequestParam Long studentId) {
        return referralService.findMine(studentId);
    }
}