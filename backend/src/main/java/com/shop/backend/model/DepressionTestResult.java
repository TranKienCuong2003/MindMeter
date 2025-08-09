package com.shop.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "depression_test_results")
public class DepressionTestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore;

    @Column(nullable = false)
    private String diagnosis;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity_level", nullable = false)
    private SeverityLevel severityLevel;

    @Column(name = "tested_at")
    private LocalDateTime testedAt;

    @Column(name = "recommendation")
    private String recommendation;

    @Column(name = "test_type", length = 50)
    private String testType;

    @OneToMany(mappedBy = "testResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DepressionTestAnswer> answers;

    public enum SeverityLevel {
        MINIMAL,
        MILD,
        MODERATE,
        SEVERE
    }

    @PrePersist
    protected void onCreate() {
        testedAt = LocalDateTime.now();
    }
} 