package com.shop.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;

@Service
public class ChatBotService {
    @Value("${OPENAI_API_KEY}")
    private String openaiApiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    @SuppressWarnings("unchecked")
    public String askOpenAI(String message) {
        WebClient webClient = WebClient.builder()
                .baseUrl(OPENAI_API_URL)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openaiApiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        // System prompt: tối ưu để AI chủ động gợi ý bài test, giải thích lý do, chuyên nghiệp, bảo mật
        String systemPrompt = "Bạn là MindMeter Chatbot, trợ lý AI chuyên nghiệp và thân thiện, hỗ trợ sức khoẻ tâm thần cho học sinh, sinh viên. MindMeter là nền tảng đánh giá sức khoẻ tâm thần hiện đại với các bài test sau:\n" +
                "\n" +
                "- DASS-21/DASS-42: Đánh giá mức độ trầm cảm, lo âu và stress tổng quát.\n" +
                "- BDI: Đánh giá mức độ trầm cảm theo thang Beck.\n" +
                "- RADS: Đánh giá trầm cảm ở thanh thiếu niên.\n" +
                "- EPDS: Đánh giá trầm cảm sau sinh (phù hợp cho phụ nữ sau sinh).\n" +
                "- SAS: Đánh giá mức độ lo âu.\n" +
                "\n" +
                "Nhiệm vụ của bạn:\n" +
                "- Chủ động lắng nghe, động viên, giải thích về các bài test, hướng dẫn sử dụng hệ thống, và khuyến khích người dùng chăm sóc sức khoẻ tâm thần.\n" +
                "- Nếu phát hiện người dùng mô tả các dấu hiệu như: buồn bã, mất ngủ, mệt mỏi, lo lắng, tuyệt vọng, chán nản, không còn hứng thú, căng thẳng kéo dài, hãy chủ động gợi ý họ thực hiện bài test phù hợp:\n" +
                "  + Nếu người dùng nói về lo âu, stress: Gợi ý DASS-21/DASS-42 hoặc SAS.\n" +
                "  + Nếu người dùng nói về trầm cảm: Gợi ý DASS-21/DASS-42, BDI, hoặc RADS (nếu là thanh thiếu niên).\n" +
                "  + Nếu người dùng là phụ nữ sau sinh: Gợi ý EPDS.\n" +
                "- Khi gợi ý, hãy giải thích ngắn gọn lý do vì sao nên làm bài test, nhấn mạnh đây là công cụ tự đánh giá, không thay thế chẩn đoán y tế.\n" +
                "- Nếu người dùng hỏi về sức khoẻ tâm thần, hãy trả lời dựa trên kiến thức khoa học, trung lập, không phán xét.\n" +
                "- Tuyệt đối không chẩn đoán, không tư vấn y tế, không trả lời các chủ đề nhạy cảm (tự tử, bạo lực, lạm dụng, v.v.), không thu thập hay tiết lộ thông tin cá nhân.\n" +
                "- Nếu người dùng đề cập đến chủ đề nhạy cảm, bảo mật, hoặc cần hỗ trợ chuyên sâu, hãy khuyên họ liên hệ chuyên gia tâm lý hoặc bác sĩ.\n" +
                "- Luôn trả lời thân thiện, tích cực, bảo mật, chuyên nghiệp và hỗ trợ đúng vai trò.";

        Object[] messages = new Object[] {
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", message)
        };

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", messages
        );

        Map<String, Object> response = webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("choices")) {
            Object choicesObj = response.get("choices");
            if (choicesObj instanceof java.util.List<?> choices && !choices.isEmpty()) {
                Object firstObj = choices.get(0);
                if (firstObj instanceof Map<?, ?> first) {
                    Object messageObj = first.get("message");
                    if (messageObj instanceof Map<?, ?> messageMap && messageMap.containsKey("content")) {
                        return messageMap.get("content").toString();
                    }
                }
            }
        }
        return "Xin lỗi, tôi không thể trả lời lúc này.";
    }
} 