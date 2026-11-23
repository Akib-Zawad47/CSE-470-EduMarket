package com.team.edumarket.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PriceBreakdown {

    private final List<CourseDiscountResult> lines = new ArrayList<>();
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal totalDiscount = BigDecimal.ZERO;
    private BigDecimal total = BigDecimal.ZERO;

    public void addLine(CourseDiscountResult line) {
        lines.add(line);
        subtotal = subtotal.add(line.getOriginalPrice());
        totalDiscount = totalDiscount.add(line.getDiscountAmount());
        total = total.add(line.getFinalPrice());
    }

    public List<CourseDiscountResult> getLines() { return lines; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public BigDecimal getTotal() { return total; }
}