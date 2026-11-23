package com.team.edumarket.controller;

import com.team.edumarket.dto.PriceBreakdown;
import com.team.edumarket.service.DiscountCalculationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class PricingController {

    private final DiscountCalculationService discountService;

    public PricingController(DiscountCalculationService discountService) {
        this.discountService = discountService;
    }

    @GetMapping("/price-preview")
    public PriceBreakdown preview(@RequestParam Long studentId,
                                  @RequestParam List<Long> courseIds,
                                  @RequestParam(required = false) String couponCode) {
        return discountService.calculate(studentId, courseIds, couponCode);
    }
}