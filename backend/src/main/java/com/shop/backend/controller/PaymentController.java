package com.shop.backend.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import com.shop.backend.repository.UserRepository;
import com.shop.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.net.Webhook;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create-checkout-session")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> payload) {
        String plan = (String) payload.getOrDefault("plan", "plus");
        long amount = 10; // default $10
        String planName = "Plus";
        if ("pro".equalsIgnoreCase(plan)) {
            amount = 20; // $20
            planName = "Pro";
        }
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/MindMeter/pricing?success=true")
                .setCancelUrl("http://localhost:3000/MindMeter/pricing?canceled=true")
                .putMetadata("plan", planName.toUpperCase())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(amount * 100) // cents
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(planName + " Plan")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .build();
        try {
            Session session = Session.create(params);
            Map<String, String> resp = new HashMap<>();
            resp.put("url", session.getUrl());
            return ResponseEntity.ok(resp);
        } catch (StripeException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        String endpointSecret = "whsec_GhLOL10YcldNo4wzNXMa0Iaxz64nNnq0";
        Event event = null;
        try {
            if (endpointSecret != null && !endpointSecret.isEmpty()) {
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            } else {
                ObjectMapper mapper = new ObjectMapper();
                event = mapper.readValue(payload, Event.class);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }
        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                String email = null;
                String plan = "PLUS";
                try {
                    email = session.getCustomerDetails().getEmail();
                    // Lấy plan từ metadata nếu có
                    if (session.getMetadata() != null && session.getMetadata().containsKey("plan")) {
                        plan = session.getMetadata().get("plan");
                        if (plan == null || plan.isEmpty()) plan = "PLUS";
                        plan = plan.toUpperCase();
                    }
                } catch (Exception e) {}
                if (email != null) {
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null) {
                        user.setPlan(plan);
                        userRepository.save(user);
                    }
                }
            }
        }
        return ResponseEntity.ok("success");
    }
} 