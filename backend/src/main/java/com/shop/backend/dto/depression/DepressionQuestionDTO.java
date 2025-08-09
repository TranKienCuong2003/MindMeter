package com.shop.backend.dto.depression;

import lombok.Data;
import java.util.List;
import com.shop.backend.model.DepressionQuestionOption;

@Data
public class DepressionQuestionDTO {
    private Long id;
    private String questionText;
    private Integer weight;
    private String category;
    private Integer order;
    private Boolean isActive;
    private List<DepressionQuestionOption> options;
} 