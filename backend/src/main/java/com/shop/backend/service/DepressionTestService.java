package com.shop.backend.service;

import com.shop.backend.dto.depression.DepressionTestRequest;
import com.shop.backend.dto.depression.DepressionTestResponse;
import com.shop.backend.dto.depression.DepressionQuestionDTO;
import com.shop.backend.dto.depression.DepressionTestResultDTO;
import com.shop.backend.model.*;
import com.shop.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepressionTestService {
    
    @Autowired
    private DepressionQuestionRepository questionRepository;
    
    @Autowired
    private DepressionQuestionOptionRepository optionRepository;
    
    @Autowired
    private DepressionTestResultRepository testResultRepository;
    
    @Autowired
    private DepressionTestAnswerRepository testAnswerRepository;
    
    public List<DepressionQuestion> getActiveQuestions() {
        return questionRepository.findByIsActiveTrue();
    }
    
    public List<DepressionQuestionDTO> getActiveQuestionDTOs() {
        List<DepressionQuestion> questions = questionRepository.findByIsActiveTrue();
        return questions.stream().map(q -> {
            DepressionQuestionDTO dto = new DepressionQuestionDTO();
            dto.setId(q.getId());
            dto.setQuestionText(q.getQuestionText());
            dto.setWeight(q.getWeight());
            dto.setCategory(q.getCategory());
            dto.setOrder(q.getOrder());
            dto.setOptions(optionRepository.findByQuestionIdOrderByOrderAsc(q.getId()));
            return dto;
        }).toList();
    }
    
    public List<DepressionQuestionDTO> getActiveQuestionDTOsByTestKey(String testKey) {
        List<DepressionQuestion> questions = questionRepository.findByTestKeyAndIsActiveTrue(testKey);
        return questions.stream().map(q -> {
            DepressionQuestionDTO dto = new DepressionQuestionDTO();
            dto.setId(q.getId());
            dto.setQuestionText(q.getQuestionText());
            dto.setWeight(q.getWeight());
            dto.setCategory(q.getCategory());
            dto.setOrder(q.getOrder());
            dto.setOptions(optionRepository.findByQuestionIdOrderByOrderAsc(q.getId()));
            return dto;
        }).toList();
    }
    
    @Transactional
    public DepressionTestResponse submitTest(Long userId, DepressionTestRequest request) {
        // Calculate total score
        int totalScore = 0;
        for (DepressionTestRequest.QuestionAnswer answer : request.getAnswers()) {
            totalScore += answer.getAnswerValue();
        }
        
        // Determine diagnosis and severity
        String diagnosis = determineDiagnosis(totalScore);
        DepressionTestResult.SeverityLevel severityLevel = determineSeverityLevel(totalScore);
        
        // Save test result
        DepressionTestResult testResult = new DepressionTestResult();
        testResult.setTotalScore(totalScore);
        testResult.setDiagnosis(diagnosis);
        testResult.setSeverityLevel(severityLevel);
        testResult.setUser(new User()); // Set user by ID
        testResult.getUser().setId(userId);
        testResult.setRecommendation(getRecommendation(severityLevel));
        testResult.setTestType(request.getTestType());
        
        testResult = testResultRepository.save(testResult);
        
        // Save individual answers
        for (DepressionTestRequest.QuestionAnswer answer : request.getAnswers()) {
            DepressionTestAnswer testAnswer = new DepressionTestAnswer();
            testAnswer.setTestResult(testResult);
            testAnswer.setQuestion(new DepressionQuestion());
            testAnswer.getQuestion().setId(answer.getQuestionId());
            testAnswer.setAnswerValue(answer.getAnswerValue());
            testAnswerRepository.save(testAnswer);
        }
        
        // Create response
        DepressionTestResponse response = new DepressionTestResponse();
        response.setTestResultId(testResult.getId());
        response.setTotalScore(totalScore);
        response.setDiagnosis(diagnosis);
        response.setSeverityLevel(severityLevel.name());
        response.setRecommendation(getRecommendation(severityLevel));
        response.setTestedAt(testResult.getTestedAt());
        response.setShouldContactExpert(severityLevel == DepressionTestResult.SeverityLevel.SEVERE);
        
        return response;
    }
    
    private String determineDiagnosis(int totalScore) {
        if (totalScore <= 4) return "Không có dấu hiệu trầm cảm";
        else if (totalScore <= 9) return "Trầm cảm nhẹ";
        else if (totalScore <= 14) return "Trầm cảm vừa";
        else if (totalScore <= 19) return "Trầm cảm nặng vừa";
        else return "Trầm cảm rất nặng";
    }
    
    private DepressionTestResult.SeverityLevel determineSeverityLevel(int totalScore) {
        if (totalScore <= 4) return DepressionTestResult.SeverityLevel.MINIMAL;
        else if (totalScore <= 9) return DepressionTestResult.SeverityLevel.MILD;
        else if (totalScore <= 14) return DepressionTestResult.SeverityLevel.MODERATE;
        else return DepressionTestResult.SeverityLevel.SEVERE;
    }
    
    private String getRecommendation(DepressionTestResult.SeverityLevel severityLevel) {
        switch (severityLevel) {
            case MINIMAL:
                return "Tình trạng tâm lý của bạn ổn định. Hãy duy trì lối sống lành mạnh.";
            case MILD:
                return "Bạn có một số dấu hiệu nhẹ. Hãy thử các hoạt động thư giãn và chia sẻ với người thân.";
            case MODERATE:
                return "Bạn có dấu hiệu trầm cảm vừa. Nên tham khảo ý kiến chuyên gia tâm lý.";
            case SEVERE:
                return "Bạn có dấu hiệu trầm cảm nặng. Hãy liên hệ chuyên gia tâm lý ngay lập tức.";
            default:
                return "Vui lòng tham khảo ý kiến chuyên gia.";
        }
    }
    
    public List<String> getAllCategories() {
        return questionRepository.findDistinctActiveCategories();
    }

    public List<DepressionTestResultDTO> getTestHistoryForUser(Long userId) {
        List<DepressionTestResult> results = testResultRepository.findByUserIdOrderByTestedAtDesc(userId);
        return results.stream().map(r -> {
            DepressionTestResultDTO dto = new DepressionTestResultDTO();
            dto.setId(r.getId());
            dto.setTotalScore(r.getTotalScore());
            dto.setSeverityLevel(r.getSeverityLevel() != null ? r.getSeverityLevel().name() : null);
            dto.setTestedAt(r.getTestedAt());
            dto.setDiagnosis(r.getDiagnosis());
            dto.setRecommendation(r.getRecommendation());
            dto.setStudentName(r.getUser() != null ? r.getUser().getFirstName() + " " + r.getUser().getLastName() : null);
            dto.setEmail(r.getUser() != null ? r.getUser().getEmail() : null);
            dto.setTestType(r.getTestType());
            return dto;
        }).toList();
    }
} 