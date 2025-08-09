package com.shop.backend.controller;

import com.shop.backend.dto.expert.ExpertNoteRequest;
import com.shop.backend.dto.expert.AdviceMessageRequest;
import com.shop.backend.model.*;
import com.shop.backend.repository.UserRepository;
import com.shop.backend.service.ExpertService;
import com.shop.backend.dto.depression.DepressionTestResultDTO;
import com.shop.backend.repository.DepressionTestAnswerRepository;
import com.shop.backend.dto.expert.AdviceMessageDTO;
import com.shop.backend.dto.UserDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/expert")
public class ExpertController {
    private static final Logger logger = LoggerFactory.getLogger(ExpertController.class);
    
    @Autowired
    private ExpertService expertService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DepressionTestAnswerRepository depressionTestAnswerRepository;
    
    // Helper method to get expert ID from authentication
    private Long getExpertIdFromAuthentication(Authentication authentication) {
        String userEmail = authentication.getName();
        logger.info("[ExpertController] Email from token: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> {
                logger.error("[ExpertController] User not found for email: {}", userEmail);
                return new RuntimeException("User not found for email: " + userEmail);
            });
        logger.info("[ExpertController] Found expertId: {} for email: {}", user.getId(), userEmail);
        return user.getId();
    }
    
    // Lấy danh sách tất cả kết quả test
    @GetMapping("/test-results")
    public ResponseEntity<List<DepressionTestResultDTO>> getAllTestResults() {
        List<DepressionTestResultDTO> results = expertService.getAllTestResultDTOs();
        return ResponseEntity.ok(results);
    }
    
    // Lấy danh sách kết quả test theo mức độ nghiêm trọng
    @GetMapping("/test-results/severity/{severityLevel}")
    public ResponseEntity<List<DepressionTestResultDTO>> getTestResultsBySeverity(
            @PathVariable String severityLevel) {
        try {
            DepressionTestResult.SeverityLevel level = DepressionTestResult.SeverityLevel.valueOf(severityLevel.toUpperCase());
            List<DepressionTestResult> results = expertService.getTestResultsBySeverity(level);
            List<DepressionTestResultDTO> dtos = results.stream().map(result -> {
                DepressionTestResultDTO dto = new DepressionTestResultDTO();
                dto.setId(result.getId());
                dto.setTotalScore(result.getTotalScore());
                dto.setSeverityLevel(result.getSeverityLevel() != null ? result.getSeverityLevel().name() : null);
                dto.setTestedAt(result.getTestedAt());
                dto.setDiagnosis(result.getDiagnosis());
                
                // Lấy thông tin user nếu có
                if (result.getUser() != null) {
                    dto.setStudentName(result.getUser().getFirstName() + " " + result.getUser().getLastName());
                    dto.setEmail(result.getUser().getEmail());
                }
                
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Lấy lịch sử test của một học sinh
    @GetMapping("/student/{studentId}/test-history")
    public ResponseEntity<List<DepressionTestResultDTO>> getStudentTestHistory(@PathVariable Long studentId) {
        List<DepressionTestResult> history = expertService.getStudentTestHistory(studentId);
        List<DepressionTestResultDTO> dtos = history.stream().map(result -> {
            DepressionTestResultDTO dto = new DepressionTestResultDTO();
            dto.setId(result.getId());
            dto.setTotalScore(result.getTotalScore());
            dto.setSeverityLevel(result.getSeverityLevel() != null ? result.getSeverityLevel().name() : null);
            dto.setTestedAt(result.getTestedAt());
            dto.setDiagnosis(result.getDiagnosis());
            
            // Lấy thông tin user nếu có
            if (result.getUser() != null) {
                dto.setStudentName(result.getUser().getFirstName() + " " + result.getUser().getLastName());
                dto.setEmail(result.getUser().getEmail());
            }
            
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    // Tạo nhận xét cho học sinh
    @PostMapping("/notes")
    public ResponseEntity<ExpertNote> createNote(
            @RequestBody ExpertNoteRequest request,
            Authentication authentication) {
        Long expertId = getExpertIdFromAuthentication(authentication);
        ExpertNote note = expertService.createNote(expertId, request);
        return ResponseEntity.ok(note);
    }
    
    // Gửi lời khuyên/tư vấn
    @PostMapping("/advice")
    public ResponseEntity<AdviceMessage> sendAdvice(
            @RequestBody AdviceMessageRequest request,
            Authentication authentication) {
        Long expertId = getExpertIdFromAuthentication(authentication);
        AdviceMessage message = expertService.sendAdvice(expertId, request);
        return ResponseEntity.ok(message);
    }
    
    // Lấy danh sách nhận xét của chuyên gia
    @GetMapping("/notes")
    public ResponseEntity<List<ExpertNote>> getExpertNotes(Authentication authentication) {
        Long expertId = getExpertIdFromAuthentication(authentication);
        List<ExpertNote> notes = expertService.getExpertNotes(expertId);
        return ResponseEntity.ok(notes);
    }
    
    // Lấy danh sách nhận xét cho một học sinh
    @GetMapping("/student/{studentId}/notes")
    public ResponseEntity<List<ExpertNote>> getStudentNotes(@PathVariable Long studentId) {
        List<ExpertNote> notes = expertService.getStudentNotes(studentId);
        return ResponseEntity.ok(notes);
    }
    
    // Lấy tin nhắn đã gửi
    @GetMapping("/messages/sent")
    public ResponseEntity<List<AdviceMessageDTO>> getSentMessages(Authentication authentication) {
        Long expertId = getExpertIdFromAuthentication(authentication);
        List<AdviceMessageDTO> messages = expertService.getSentMessages(expertId);
        logger.info("[ExpertController] expertId {} has {} sent advice messages", expertId, messages.size());
        return ResponseEntity.ok(messages);
    }
    
    // Đánh dấu tin nhắn đã đọc
    @PutMapping("/messages/{messageId}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long messageId) {
        expertService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }
    
    // Lấy đáp án chi tiết cho một bài test
    @GetMapping("/test-results/{testResultId}/answers")
    public ResponseEntity<List<AnswerDetailDTO>> getTestAnswers(@PathVariable Long testResultId) {
        List<DepressionTestAnswer> answers = depressionTestAnswerRepository.findByTestResultId(testResultId);
        List<AnswerDetailDTO> result = answers.stream().map(ans -> {
            AnswerDetailDTO dto = new AnswerDetailDTO();
            dto.setQuestionId(ans.getQuestion().getId());
            dto.setQuestionText(ans.getQuestion().getQuestionText());
            dto.setAnswerValue(ans.getAnswerValue());
            return dto;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // DTO cho đáp án chi tiết
    public static class AnswerDetailDTO {
        private Long questionId;
        private String questionText;
        private Integer answerValue;
        // getters/setters
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public Integer getAnswerValue() { return answerValue; }
        public void setAnswerValue(Integer answerValue) { this.answerValue = answerValue; }
    }

    // Thống kê số lượt test theo ngày (và số severe test) trong khoảng thời gian
    @GetMapping("/statistics/test-count-by-date")
    public ResponseEntity<?> getTestCountByDateRange(@RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(expertService.getTestCountByDateRange(days));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getCurrentExpertProfile(Authentication authentication) {
        String email = authentication.getName();
        UserDTO dto = expertService.getCurrentExpertProfile(email);
        return ResponseEntity.ok(dto);
    }
} 