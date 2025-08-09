package com.shop.backend.controller;

import com.shop.backend.model.*;
import com.shop.backend.service.AdminService;
import com.shop.backend.dto.SystemAnnouncementDTO;
import com.shop.backend.dto.depression.DepressionTestResultDTO;
import com.shop.backend.dto.UserDTO;
import com.shop.backend.dto.depression.DepressionQuestionDTO;
import com.shop.backend.dto.depression.CreateQuestionRequest;
import com.shop.backend.repository.DepressionTestAnswerRepository;
import com.shop.backend.model.DepressionQuestionOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private DepressionTestAnswerRepository depressionTestAnswerRepository;
    
    // Quản lý người dùng
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        List<UserDTO> dtos = users.stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole() != null ? user.getRole().name() : null);
            dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
            dto.setAvatarUrl(user.getAvatarUrl());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setUpdatedAt(user.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            List<User> users = adminService.getUsersByRole(userRole);
            List<UserDTO> dtos = users.stream().map(user -> {
                UserDTO dto = new UserDTO();
                dto.setId(user.getId());
                dto.setFirstName(user.getFirstName());
                dto.setLastName(user.getLastName());
                dto.setEmail(user.getEmail());
                dto.setPhone(user.getPhone());
                dto.setRole(user.getRole() != null ? user.getRole().name() : null);
                dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
                dto.setAvatarUrl(user.getAvatarUrl());
                dto.setCreatedAt(user.getCreatedAt());
                dto.setUpdatedAt(user.getUpdatedAt());
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam String status) {
        try {
            User user = adminService.updateUserStatus(userId, status);
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole() != null ? user.getRole().name() : null);
            dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
            dto.setAvatarUrl(user.getAvatarUrl());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setUpdatedAt(user.getUpdatedAt());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long userId,
            @RequestParam String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            User user = adminService.updateUserRole(userId, userRole);
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole() != null ? user.getRole().name() : null);
            dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
            dto.setAvatarUrl(user.getAvatarUrl());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setUpdatedAt(user.getUpdatedAt());
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Quản lý câu hỏi
    @GetMapping("/questions")
    public ResponseEntity<List<DepressionQuestionDTO>> getAllQuestions() {
        List<DepressionQuestion> questions = adminService.getAllQuestions();
        List<DepressionQuestionDTO> dtos = questions.stream().map(question -> {
            DepressionQuestionDTO dto = new DepressionQuestionDTO();
            dto.setId(question.getId());
            dto.setQuestionText(question.getQuestionText());
            dto.setWeight(question.getWeight());
            dto.setCategory(question.getCategory());
            dto.setOrder(question.getOrder());
            dto.setIsActive(question.getIsActive());
            // Lấy danh sách đáp án cho câu hỏi
            List<DepressionQuestionOption> options = adminService.getQuestionOptions(question.getId());
            dto.setOptions(options);
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping("/questions")
    public ResponseEntity<DepressionQuestionDTO> createQuestion(@RequestBody CreateQuestionRequest request) {
        DepressionQuestion created = adminService.createQuestionWithOptions(request);
        DepressionQuestionDTO dto = new DepressionQuestionDTO();
        dto.setId(created.getId());
        dto.setQuestionText(created.getQuestionText());
        dto.setWeight(created.getWeight());
        dto.setCategory(created.getCategory());
        dto.setOrder(created.getOrder());
        dto.setIsActive(created.getIsActive());
        // Lấy danh sách đáp án cho câu hỏi vừa tạo
        List<DepressionQuestionOption> options = adminService.getQuestionOptions(created.getId());
        dto.setOptions(options);
        return ResponseEntity.ok(dto);
    }
    
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<DepressionQuestionDTO> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody CreateQuestionRequest request) {
        try {
            DepressionQuestion updated = adminService.updateQuestionWithOptions(questionId, request);
            DepressionQuestionDTO dto = new DepressionQuestionDTO();
            dto.setId(updated.getId());
            dto.setQuestionText(updated.getQuestionText());
            dto.setWeight(updated.getWeight());
            dto.setCategory(updated.getCategory());
            dto.setOrder(updated.getOrder());
            dto.setIsActive(updated.getIsActive());
            // Lấy danh sách đáp án cho câu hỏi
            List<DepressionQuestionOption> options = adminService.getQuestionOptions(updated.getId());
            dto.setOptions(options);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long questionId) {
        try {
            adminService.deleteQuestion(questionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/questions/{questionId}/toggle")
    public ResponseEntity<?> toggleQuestionStatus(@PathVariable Long questionId) {
        adminService.toggleQuestionStatus(questionId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/questions/categories")
    public ResponseEntity<List<String>> getQuestionCategories() {
        List<String> categories = adminService.getActiveQuestionCategories();
        return ResponseEntity.ok(categories);
    }
    
    // Quản lý thông báo hệ thống
    @GetMapping("/announcements")
    public ResponseEntity<List<SystemAnnouncementDTO>> getAllAnnouncements() {
        List<SystemAnnouncementDTO> dtos = adminService.getAllAnnouncements().stream().map(a -> {
            SystemAnnouncementDTO dto = new SystemAnnouncementDTO();
            dto.setId(a.getId());
            dto.setTitle(a.getTitle());
            dto.setContent(a.getContent());
            dto.setAnnouncementType(a.getAnnouncementType() != null ? a.getAnnouncementType().name() : null);
            dto.setIsActive(a.getIsActive());
            dto.setCreatedAt(a.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/announcements/active")
    public ResponseEntity<List<SystemAnnouncementDTO>> getActiveAnnouncements() {
        List<SystemAnnouncementDTO> dtos = adminService.getActiveAnnouncements().stream().map(a -> {
            SystemAnnouncementDTO dto = new SystemAnnouncementDTO();
            dto.setId(a.getId());
            dto.setTitle(a.getTitle());
            dto.setContent(a.getContent());
            dto.setAnnouncementType(a.getAnnouncementType() != null ? a.getAnnouncementType().name() : null);
            dto.setIsActive(a.getIsActive());
            dto.setCreatedAt(a.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping("/announcements")
    public ResponseEntity<SystemAnnouncementDTO> createAnnouncement(@RequestBody SystemAnnouncement announcement) {
        SystemAnnouncement created = adminService.createAnnouncement(announcement);
        SystemAnnouncementDTO dto = new SystemAnnouncementDTO();
        dto.setId(created.getId());
        dto.setTitle(created.getTitle());
        dto.setContent(created.getContent());
        dto.setAnnouncementType(created.getAnnouncementType() != null ? created.getAnnouncementType().name() : null);
        dto.setIsActive(created.getIsActive());
        dto.setCreatedAt(created.getCreatedAt());
        return ResponseEntity.ok(dto);
    }
    
    @PutMapping("/announcements/{announcementId}")
    public ResponseEntity<SystemAnnouncement> updateAnnouncement(
            @PathVariable Long announcementId,
            @RequestBody SystemAnnouncement announcementDetails) {
        try {
            SystemAnnouncement updated = adminService.updateAnnouncement(announcementId, announcementDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/announcements/{announcementId}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long announcementId) {
        try {
            adminService.deleteAnnouncement(announcementId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/announcements/{announcementId}/toggle")
    public ResponseEntity<?> toggleAnnouncementStatus(@PathVariable Long announcementId) {
        adminService.toggleAnnouncementStatus(announcementId);
        return ResponseEntity.ok().build();
    }
    
    // Thống kê hệ thống
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        Map<String, Object> stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/test-results/recent")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<List<DepressionTestResultDTO>> getRecentTestResults() {
        List<DepressionTestResult> results = adminService.getRecentTestResults(10);
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
    }
    
    @GetMapping("/test-results")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DepressionTestResultDTO>> getAllTestResults() {
        List<DepressionTestResultDTO> results = adminService.getAllTestResultDTOs();
        return ResponseEntity.ok(results);
    }
    
    @DeleteMapping("/test-results/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTestResult(@PathVariable Long id) {
        try {
            adminService.deleteTestResult(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/test-results/{testResultId}/answers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnswerDetailDTO>> getTestAnswers(@PathVariable Long testResultId) {
        List<com.shop.backend.model.DepressionTestAnswer> answers = depressionTestAnswerRepository.findByTestResultId(testResultId);
        List<AnswerDetailDTO> result = answers.stream().map(ans -> {
            AnswerDetailDTO dto = new AnswerDetailDTO();
            dto.setQuestionId(ans.getQuestion().getId());
            dto.setQuestionText(ans.getQuestion().getQuestionText());
            dto.setAnswerValue(ans.getAnswerValue());
            return dto;
        }).toList();
        return ResponseEntity.ok(result);
    }
    public static class AnswerDetailDTO {
        private Long questionId;
        private String questionText;
        private Integer answerValue;
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public Integer getAnswerValue() { return answerValue; }
        public void setAnswerValue(Integer answerValue) { this.answerValue = answerValue; }
    }
    
    // Thống kê số lượt test theo ngày (và số severe test)
    @GetMapping("/statistics/test-count-by-date")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> getTestCountByDate(@RequestParam(defaultValue = "14") int days) {
        Map<String, Object> result = adminService.getTestCountByDateRange(days);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal org.springframework.security.core.userdetails.User userDetails) {
        User user = adminService.getUserByEmail(userDetails.getUsername());
        if (user == null) return ResponseEntity.notFound().build();
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return ResponseEntity.ok(dto);
    }
} 