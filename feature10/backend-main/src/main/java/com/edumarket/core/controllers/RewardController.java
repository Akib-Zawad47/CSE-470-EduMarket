package com.edumarket.core.controllers;

import com.edumarket.core.services.RewardService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin(originPatterns = "*")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping("/balance")
    public Map<String, Object> balance(@RequestParam Long studentId) {
        return Map.of("studentId", studentId, "rewardPoints", rewardService.getBalance(studentId));
    }

    @PostMapping("/redeem")
    public Map<String, Object> redeem(@RequestParam Long studentId, @RequestParam int points) {
        return Map.of("studentId", studentId, "rewardPoints", rewardService.redeem(studentId, points));
    }
}