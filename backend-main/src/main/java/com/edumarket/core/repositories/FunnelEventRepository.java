package com.edumarket.core.repositories;

import com.edumarket.core.models.FunnelEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FunnelEventRepository extends JpaRepository<FunnelEvent, Long> {
}