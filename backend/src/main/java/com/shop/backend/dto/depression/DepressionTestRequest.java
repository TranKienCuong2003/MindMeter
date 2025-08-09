package com.shop.backend.dto.depression;

import lombok.Data;
import java.util.List;

@Data
public class DepressionTestRequest {
    private List<QuestionAnswer> answers;
    private String testType;
    
    @Data
    public static class QuestionAnswer {
        private Long questionId;
        private Integer answerValue; // 0-3 scale
    }
} 