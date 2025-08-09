package com.shop.backend.security;

import com.shop.backend.model.User;
import com.shop.backend.model.Role;
import com.shop.backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Date;
import java.util.Optional;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class CustomOAuth2SuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public CustomOAuth2SuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            // Có thể log thêm thông tin sub để debug
            String sub = oAuth2User.getAttribute("sub");
            System.err.println("[OAuth2] Không lấy được email từ Google! sub=" + sub);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Không lấy được email từ Google. Vui lòng cấp quyền truy cập email.");
            return;
        }
        String name = oAuth2User.getAttribute("name");

        // Đảm bảo email luôn lowercase để tránh trùng lặp do khác hoa/thường
        email = email != null ? email.trim().toLowerCase() : null;
        // Tìm user theo email đã chuẩn hóa
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            System.out.println("[OAuth2] Đã tồn tại user với email: " + email + ", id: " + user.getId());
        } else {
            user = new User();
            user.setEmail(email);
            // Tách tên thành firstName và lastName
            String[] nameParts = name != null ? name.split(" ", 2) : new String[2];
            user.setFirstName(nameParts != null && nameParts.length > 0 ? nameParts[0] : "");
            user.setLastName(nameParts != null && nameParts.length > 1 ? nameParts[1] : "");
            user.setRole(Role.STUDENT);
            user.setStatus(User.Status.ACTIVE);
            userRepository.save(user);
            System.out.println("[OAuth2] Created new STUDENT user: " + email + ", id: " + user.getId());
        }

        // Sinh JWT không deprecated
        Key key = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), SignatureAlgorithm.HS256.getJcaName());
        String token = Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("firstName", user.getFirstName())
                .claim("lastName", user.getLastName())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        // Redirect về frontend kèm token
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .queryParam("token", token)
                .build().toUriString();
        response.sendRedirect(redirectUrl);
    }
} 