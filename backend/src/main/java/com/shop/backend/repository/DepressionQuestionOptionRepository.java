package com.shop.backend.repository;

import com.shop.backend.model.DepressionQuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DepressionQuestionOptionRepository extends JpaRepository<DepressionQuestionOption, Long> {
    List<DepressionQuestionOption> findByQuestionIdOrderByOrderAsc(Long questionId);
} 