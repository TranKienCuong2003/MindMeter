package com.shop.backend.controller;

import com.shop.backend.dto.depression.DepressionTestRequest;
import com.shop.backend.dto.depression.DepressionTestResponse;
import com.shop.backend.dto.depression.DepressionQuestionDTO;
import com.shop.backend.dto.depression.DepressionTestResultDTO;
import com.shop.backend.model.User;
import com.shop.backend.repository.UserRepository;
import com.shop.backend.service.DepressionTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/depression-test")
public class DepressionTestController {
    
    @Autowired
    private DepressionTestService depressionTestService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/questions")
    public ResponseEntity<List<DepressionQuestionDTO>> getQuestions(@RequestParam(value = "type", required = false) String testKey) {
        List<DepressionQuestionDTO> questions;
        if (testKey != null && !testKey.isEmpty()) {
            questions = depressionTestService.getActiveQuestionDTOsByTestKey(testKey);
        } else {
            questions = depressionTestService.getActiveQuestionDTOs();
        }
        return ResponseEntity.ok(questions);
    }
    
    @PostMapping("/submit")
    public ResponseEntity<DepressionTestResponse> submitTest(
            @RequestBody DepressionTestRequest request,
            Authentication authentication) {
        String userName = authentication.getName();
        User user;
        if (userName.startsWith("anonymous_")) {
            Long userId = Long.parseLong(userName.substring("anonymous_".length()));
            user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        } else {
            user = userRepository.findByEmail(userName)
                .orElseThrow(() -> new RuntimeException("User not found"));
        }
        DepressionTestResponse response = depressionTestService.submitTest(user.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = depressionTestService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/history")
    public ResponseEntity<List<DepressionTestResultDTO>> getTestHistory(Authentication authentication) {
        String userEmail = authentication.getName();
        System.out.println("[DEBUG] Email from token: " + userEmail);
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            System.err.println("[DEBUG] User not found for email: " + userEmail);
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        System.out.println("[DEBUG] User id: " + user.getId());
        List<DepressionTestResultDTO> history = depressionTestService.getTestHistoryForUser(user.getId());
        System.out.println("[DEBUG] History size: " + (history != null ? history.size() : 0));
        return ResponseEntity.ok(history);
    }
} 