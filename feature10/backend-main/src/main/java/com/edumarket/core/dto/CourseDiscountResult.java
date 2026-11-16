package com.edumarket.core.dto;

import java.math.BigDecimal;

public class CourseDiscountResult {

    private final Long courseId;
    private final String title;
    private final BigDecimal originalPrice;
    private final BigDecimal discountAmount;
    private final BigDecimal finalPrice;
    private final Long promotionId;
    private final String promotionType;
    private final String couponCode;

    public CourseDiscountResult(Long courseId, String title, BigDecimal originalPrice,
                                BigDecimal discountAmount, BigDecimal finalPrice,
                                Long promotionId, String promotionType, String couponCode) {
        this.courseId = courseId;
        this.title = title;
        this.originalPrice = originalPrice;
        this.discountAmount = discountAmount;
        this.finalPrice = finalPrice;
        this.promotionId = promotionId;
        this.promotionType = promotionType;
        this.couponCode = couponCode;
    }

    public Long getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public BigDecimal getFinalPrice() { return finalPrice; }
    public Long getPromotionId() { return promotionId; }
    public String getPromotionType() { return promotionType; }
    public String getCouponCode() { return couponCode; }
}