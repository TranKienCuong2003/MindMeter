package com.shop.backend.repository;

import com.shop.backend.model.DepressionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DepressionQuestionRepository extends JpaRepository<DepressionQuestion, Long> {
    List<DepressionQuestion> findByIsActiveTrue();
    List<DepressionQuestion> findByIsActive(Boolean isActive);
    long countByIsActiveTrue();

    @Query("SELECT DISTINCT q.category FROM DepressionQuestion q")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT q.category FROM DepressionQuestion q WHERE q.isActive = true")
    List<String> findDistinctActiveCategories();

    List<DepressionQuestion> findByTestKeyAndIsActiveTrue(String testKey);
} 