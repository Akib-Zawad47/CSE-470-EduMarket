package com.team.edumarket.service;

import com.team.edumarket.dto.CourseDiscountResult;
import com.team.edumarket.dto.PriceBreakdown;
import com.team.edumarket.model.Course;
import com.team.edumarket.model.Promotion;
import com.team.edumarket.repository.CourseRepository;
import com.team.edumarket.repository.PromotionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class DiscountCalculationService {

    private final CourseRepository courseRepository;
    private final PromotionRepository promotionRepository;

    public DiscountCalculationService(CourseRepository courseRepository,
                                      PromotionRepository promotionRepository) {
        this.courseRepository = courseRepository;
        this.promotionRepository = promotionRepository;
    }

    public PriceBreakdown calculate(Long studentId, List<Long> courseIds, String couponCode) {
        List<Course> courses = courseRepository.findAllById(courseIds);
        if (courses.isEmpty()) {
            throw new IllegalArgumentException("No valid courses in the cart");
        }

        PriceBreakdown breakdown = new PriceBreakdown();
        for (Course course : courses) {
            Promotion best = findBestPromotion(course, courses.size(), studentId, couponCode);
            breakdown.addLine(buildLine(course, best));
        }
        return breakdown;
    }

    private CourseDiscountResult buildLine(Course course, Promotion promotion) {
        BigDecimal price = course.getPrice();
        BigDecimal discount = BigDecimal.ZERO;
        Long promotionId = null;
        String type = null;
        String code = null;

        if (promotion != null) {
            discount = promotion.getDiscountValue().setScale(2, RoundingMode.HALF_UP).min(price);
            promotionId = promotion.getPromotionId();
            type = promotion.getType();
            code = promotion.getCouponCode();
        }
        BigDecimal finalPrice = price.subtract(discount);
        return new CourseDiscountResult(course.getCourseId(), course.getTitle(),
                price, discount, finalPrice, promotionId, type, code);
    }

    private Promotion findBestPromotion(Course course, int cartSize,
                                        Long studentId, String couponCode) {
        List<Promotion> candidates =
                promotionRepository.findActiveForCourse(course.getCourseId(), LocalDate.now());

        Promotion best = null;

        for (Promotion p : candidates) {
            boolean codeMatches = couponCode != null
                    && couponCode.equalsIgnoreCase(p.getCouponCode());

            boolean qualifies = false;

            if (Promotion.TYPE_EARLY_BIRD.equals(p.getType())) {
                qualifies = true;
            } else if (Promotion.TYPE_COUPON.equals(p.getType())
                    || Promotion.TYPE_TIME_LIMITED.equals(p.getType())) {
                qualifies = codeMatches;
            } else if (Promotion.TYPE_BUNDLE.equals(p.getType())) {
                qualifies = codeMatches && cartSize >= 2;
            }

            if (qualifies && (best == null
                    || p.getDiscountValue().compareTo(best.getDiscountValue()) > 0)) {
                best = p;
            }
        }

        return best;
    }
}