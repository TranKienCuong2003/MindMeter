package com.shop.backend.service;

import com.shop.backend.model.*;
import com.shop.backend.repository.*;
import com.shop.backend.dto.depression.DepressionTestResultDTO;
import com.shop.backend.dto.depression.CreateQuestionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DepressionQuestionRepository questionRepository;
    
    @Autowired
    private DepressionTestResultRepository testResultRepository;
    
    @Autowired
    private SystemAnnouncementRepository announcementRepository;
    
    @Autowired
    private AdviceMessageRepository adviceMessageRepository;
    
    @Autowired
    private DepressionQuestionOptionRepository optionRepository;
    
    // Quản lý người dùng
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
    
    @Transactional
    public User updateUserStatus(Long userId, String status) {
        return userRepository.findById(userId)
            .map(user -> {
                user.setStatus(User.Status.valueOf(status.toUpperCase()));
                return userRepository.save(user);
            })
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
    
    @Transactional
    public User updateUserRole(Long userId, Role role) {
        return userRepository.findById(userId)
            .map(user -> {
                user.setRole(role);
                return userRepository.save(user);
            })
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    // Quản lý câu hỏi
    public List<DepressionQuestion> getAllQuestions() {
        return questionRepository.findAll();
    }
    
    public List<DepressionQuestionOption> getQuestionOptions(Long questionId) {
        return optionRepository.findByQuestionIdOrderByOrderAsc(questionId);
    }
    
    public List<String> getActiveQuestionCategories() {
        return questionRepository.findDistinctActiveCategories();
    }
    
    @Transactional
    public DepressionQuestion createQuestion(DepressionQuestion question) {
        return questionRepository.save(question);
    }
    
    @Transactional
    public DepressionQuestion createQuestionWithOptions(CreateQuestionRequest request) {
        // Tạo câu hỏi
        DepressionQuestion question = new DepressionQuestion();
        question.setQuestionText(request.getQuestionText());
        question.setWeight(request.getWeight() != null ? request.getWeight() : 1);
        question.setCategory(request.getCategory());
        question.setOrder(request.getOrder() != null ? request.getOrder() : 1);
        question.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        question.setTestKey(request.getTestKey() != null ? request.getTestKey() : "DASS-21");
        
        question = questionRepository.save(question);
        
        // Tạo các lựa chọn nếu có
        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            for (CreateQuestionRequest.QuestionOptionRequest optionRequest : request.getOptions()) {
                DepressionQuestionOption option = new DepressionQuestionOption();
                option.setQuestion(question);
                option.setOptionText(optionRequest.getOptionText());
                option.setOptionValue(optionRequest.getOptionValue());
                option.setOrder(optionRequest.getOrder() != null ? optionRequest.getOrder() : 1);
                optionRepository.save(option);
            }
        }
        
        return question;
    }
    
    @Transactional
    public DepressionQuestion updateQuestion(Long questionId, DepressionQuestion questionDetails) {
        return questionRepository.findById(questionId)
            .map(question -> {
                question.setQuestionText(questionDetails.getQuestionText());
                question.setWeight(questionDetails.getWeight());
                question.setIsActive(questionDetails.getIsActive());
                return questionRepository.save(question);
            })
            .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi"));
    }
    
    @Transactional
    public DepressionQuestion updateQuestionWithOptions(Long questionId, CreateQuestionRequest request) {
        DepressionQuestion question = questionRepository.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi"));

        question.setQuestionText(request.getQuestionText());
        question.setWeight(request.getWeight());
        question.setIsActive(request.getIsActive());
        question.setCategory(request.getCategory());
        question.setOrder(request.getOrder());
        questionRepository.save(question);

        // Xóa đáp án cũ
        optionRepository.deleteAll(optionRepository.findByQuestionIdOrderByOrderAsc(questionId));

        // Thêm đáp án mới
        if (request.getOptions() != null) {
            for (CreateQuestionRequest.QuestionOptionRequest optionRequest : request.getOptions()) {
                DepressionQuestionOption option = new DepressionQuestionOption();
                option.setQuestion(question);
                option.setOptionText(optionRequest.getOptionText());
                option.setOptionValue(optionRequest.getOptionValue());
                option.setOrder(optionRequest.getOrder());
                optionRepository.save(option);
            }
        }
        return question;
    }
    
    @Transactional
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
    }
    
    @Transactional
    public void toggleQuestionStatus(Long questionId) {
        questionRepository.findById(questionId)
            .ifPresent(question -> {
                question.setIsActive(!question.getIsActive());
                questionRepository.save(question);
            });
    }
    
    // Quản lý thông báo hệ thống
    public List<SystemAnnouncement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }
    
    public List<SystemAnnouncement> getActiveAnnouncements() {
        return announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }
    
    @Transactional
    public SystemAnnouncement createAnnouncement(SystemAnnouncement announcement) {
        return announcementRepository.save(announcement);
    }
    
    @Transactional
    public SystemAnnouncement updateAnnouncement(Long announcementId, SystemAnnouncement announcementDetails) {
        return announcementRepository.findById(announcementId)
            .map(announcement -> {
                announcement.setTitle(announcementDetails.getTitle());
                announcement.setContent(announcementDetails.getContent());
                announcement.setAnnouncementType(announcementDetails.getAnnouncementType());
                announcement.setIsActive(announcementDetails.getIsActive());
                return announcementRepository.save(announcement);
            })
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
    }
    
    @Transactional
    public void deleteAnnouncement(Long announcementId) {
        announcementRepository.deleteById(announcementId);
    }
    
    @Transactional
    public void toggleAnnouncementStatus(Long announcementId) {
        announcementRepository.findById(announcementId)
            .ifPresent(announcement -> {
                announcement.setIsActive(!announcement.getIsActive());
                announcementRepository.save(announcement);
            });
    }
    
    // Thống kê hệ thống
    public Map<String, Object> getSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Thống kê người dùng
        long totalUsers = userRepository.count();
        long studentCount = userRepository.countByRole(Role.STUDENT);
        long expertCount = userRepository.countByRole(Role.EXPERT);
        long adminCount = userRepository.countByRole(Role.ADMIN);
        
        stats.put("totalUsers", totalUsers);
        stats.put("studentCount", studentCount);
        stats.put("expertCount", expertCount);
        stats.put("adminCount", adminCount);
        
        // Thống kê bài test
        long totalTests = testResultRepository.count();
        long minimalTests = testResultRepository.countBySeverityLevel(DepressionTestResult.SeverityLevel.MINIMAL);
        long mildTests = testResultRepository.countBySeverityLevel(DepressionTestResult.SeverityLevel.MILD);
        long moderateTests = testResultRepository.countBySeverityLevel(DepressionTestResult.SeverityLevel.MODERATE);
        long severeTests = testResultRepository.countBySeverityLevel(DepressionTestResult.SeverityLevel.SEVERE);
        
        stats.put("totalTests", totalTests);
        stats.put("minimalTests", minimalTests);
        stats.put("mildTests", mildTests);
        stats.put("moderateTests", moderateTests);
        stats.put("severeTests", severeTests);
        
        // Tính tỷ lệ
        if (totalTests > 0) {
            stats.put("minimalPercentage", (double) minimalTests / totalTests * 100);
            stats.put("mildPercentage", (double) mildTests / totalTests * 100);
            stats.put("moderatePercentage", (double) moderateTests / totalTests * 100);
            stats.put("severePercentage", (double) severeTests / totalTests * 100);
        }
        
        // Thống kê câu hỏi
        long totalQuestions = questionRepository.count();
        long activeQuestions = questionRepository.countByIsActiveTrue();
        
        stats.put("totalQuestions", totalQuestions);
        stats.put("activeQuestions", activeQuestions);
        
        // Thống kê tổng số lời khuyên đã gửi
        long totalAdvices = adviceMessageRepository.count();
        stats.put("totalAdvices", totalAdvices);
        return stats;
    }
    
    // Lấy danh sách kết quả test gần đây
    public List<DepressionTestResult> getRecentTestResults(int limit) {
        return testResultRepository.findTop10ByOrderByTestedAtDesc();
    }
    
    public List<DepressionTestResultDTO> getAllTestResultDTOs() {
        List<DepressionTestResult> results = testResultRepository.findAllByOrderByTestedAtDesc();
        return results.stream().map(result -> {
            DepressionTestResultDTO dto = new DepressionTestResultDTO();
            dto.setId(result.getId());
            dto.setTotalScore(result.getTotalScore());
            dto.setSeverityLevel(result.getSeverityLevel() != null ? result.getSeverityLevel().name() : null);
            dto.setTestedAt(result.getTestedAt());
            dto.setDiagnosis(result.getDiagnosis());
            if (result.getUser() != null) {
                dto.setStudentName(result.getUser().getFirstName() + " " + result.getUser().getLastName());
                dto.setEmail(result.getUser().getEmail());
                dto.setUserId(result.getUser().getId()); // Thêm trường userId
            }
            return dto;
        }).toList();
    }
    
    @Transactional
    public void deleteTestResult(Long id) {
        testResultRepository.deleteById(id);
    }
    
    // Thống kê số lượt test theo ngày (và số severe test) trong khoảng thời gian
    public Map<String, Object> getTestCountByDateRange(int days) {
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate from = today.minusDays(days - 1);
        java.time.LocalDateTime fromDateTime = from.atStartOfDay();
        java.time.LocalDateTime toDateTime = today.atTime(23, 59, 59);
        // Lấy tổng số test theo ngày
        List<Object[]> totalList = testResultRepository.countTestsByDateRange(fromDateTime, toDateTime);
        // Lấy số severe test theo ngày
        List<Object[]> severeList = testResultRepository.countSevereTestsByDateRange(fromDateTime, toDateTime);
        // Map ngày -> count
        Map<String, Integer> totalMap = new java.util.HashMap<>();
        for (Object[] row : totalList) {
            totalMap.put(row[0].toString(), ((Number)row[1]).intValue());
        }
        Map<String, Integer> severeMap = new java.util.HashMap<>();
        for (Object[] row : severeList) {
            severeMap.put(row[0].toString(), ((Number)row[1]).intValue());
        }
        // Build kết quả đủ ngày (nếu ngày nào không có thì count = 0)
        java.util.List<String> dates = new java.util.ArrayList<>();
        java.util.List<Integer> totalTests = new java.util.ArrayList<>();
        java.util.List<Integer> severeTests = new java.util.ArrayList<>();
        for (int i = 0; i < days; i++) {
            java.time.LocalDate d = from.plusDays(i);
            String key = d.toString();
            dates.add(key);
            totalTests.add(totalMap.getOrDefault(key, 0));
            severeTests.add(severeMap.getOrDefault(key, 0));
        }
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("dates", dates);
        result.put("totalTests", totalTests);
        result.put("severeTests", severeTests);
        return result;
    }
} 