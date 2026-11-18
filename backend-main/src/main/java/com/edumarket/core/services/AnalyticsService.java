package com.edumarket.core.services;

import com.edumarket.core.models.FunnelStageDto;
import com.edumarket.core.models.TrendingCourseDto;
import com.edumarket.core.repositories.AnalyticsRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    public List<TrendingCourseDto> getTrendingCourses() {
        return analyticsRepository.findTopTrendingCourses();
    }

    public Map<String, Object> getCourseDropOffInsights(Long courseId) {
        List<FunnelStageDto> rawStages = analyticsRepository.findFunnelByCourseId(courseId);
        Map<String, Long> counts = new LinkedHashMap<>();
        List<String> orderedStages = List.of(
            "PAGE_VIEW", "ADD_TO_CART", "CHECKOUT_START", "PURCHASE", "ABANDON"
        );
        orderedStages.forEach(s -> counts.put(s, 0L));

        for (FunnelStageDto row : rawStages) {
            if (counts.containsKey(row.getStage())) {
                counts.put(row.getStage(), row.getCount());
            }
        }

        long views = counts.get("PAGE_VIEW");
        long purchases = counts.get("PURCHASE");
        double conversionRate = views > 0 ? Math.round(((double) purchases / views) * 10000.0) / 100.0 : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("courseId", courseId);
        result.put("funnelStages", counts);
        result.put("overallConversionRatePercent", conversionRate);
        return result;
    }
}