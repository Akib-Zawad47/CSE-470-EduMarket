package com.edumarket.core.services;

import com.edumarket.core.dto.CourseDiscountResult;
import com.edumarket.core.dto.PriceBreakdown;
import com.edumarket.core.models.Course;
import com.edumarket.core.models.Promotion;
import com.edumarket.core.repositories.CourseRepository;
import com.edumarket.core.repositories.PromotionRepository;
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

    // Works out the price of every course in the cart.
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

    // Turns one course + its promotion into one price line.
    private CourseDiscountResult buildLine(Course course, Promotion promotion) {
        BigDecimal price = course.getPrice();
        BigDecimal discount = BigDecimal.ZERO;
        Long promotionId = null;
        String type = null;
        String code = null;

        if (promotion != null) {
            // the discount can never be bigger than the price
            discount = promotion.getDiscountValue().setScale(2, RoundingMode.HALF_UP).min(price);
            promotionId = promotion.getPromotionId();
            type = promotion.getType();
            code = promotion.getCouponCode();
        }
        BigDecimal finalPrice = price.subtract(discount);
        return new CourseDiscountResult(course.getCourseId(), course.getTitle(),
                price, discount, finalPrice, promotionId, type, code);
    }

        // YOUR PART: decide which promotion (if any) applies to this course.
    private Promotion findBestPromotion(Course course, int cartSize,
                                        Long studentId, String couponCode) {

        // Promotions of this course that are ACTIVE and valid today
        List<Promotion> candidates =
                promotionRepository.findActiveForCourse(course.getCourseId(), LocalDate.now());

        Promotion best = null;

        for (Promotion p : candidates) {

            // true if the student typed this promotion's code (capital letters don't matter)
            boolean codeMatches = couponCode != null
                    && couponCode.equalsIgnoreCase(p.getCouponCode());

            boolean qualifies = false;

            if (Promotion.TYPE_EARLY_BIRD.equals(p.getType())) {
                // early-bird applies automatically, no code needed
                qualifies = true;
            } else if (Promotion.TYPE_COUPON.equals(p.getType())
                    || Promotion.TYPE_TIME_LIMITED.equals(p.getType())) {
                // coupons and time-limited deals need the student to type the code
                qualifies = codeMatches;
            } else if (Promotion.TYPE_BUNDLE.equals(p.getType())) {
                // bundles need the code AND at least 2 courses in the cart
                qualifies = codeMatches && cartSize >= 2;
            }

            // keep the promotion with the biggest amount (no stacking)
            if (qualifies && (best == null
                    || p.getDiscountValue().compareTo(best.getDiscountValue()) > 0)) {
                best = p;
            }
        }

        return best;   // null means: no promotion, no discount
    }
}