package com.team.edumarket.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "students")
public class Student {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "reward_points", nullable = false)
    private Integer rewardPoints;

    public Long getUserId() { return userId; }
    public Integer getRewardPoints() { return rewardPoints; }
}