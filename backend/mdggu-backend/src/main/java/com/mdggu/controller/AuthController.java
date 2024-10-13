// 사용자 인증 관련 API 엔드포인트
package com.mdggu.controller;

import com.mdggu.config.TokenProvider;
import com.mdggu.model.User;
import com.mdggu.service.CustomUserDetailsService;
import com.mdggu.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final CustomUserDetailsService userDetailsService;
    private UserService userService; // 필드 선언
    private TokenProvider tokenProvider; // 필드 선언, 이름 수정
    private AuthenticationManager authenticationManager; // 필드 선언
    private MessageSource messageSource; // 필드 선언

    @Autowired
    public AuthController(UserService userService, TokenProvider tokenProvider,
                          AuthenticationManager authenticationManager, MessageSource messageSource,
                          CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        this.userService = userService; // userService 초기화
        this.tokenProvider = tokenProvider; // TokenProvider 초기화
        this.authenticationManager = authenticationManager; // authenticationManager 초기화
        this.messageSource = messageSource; // messageSource 초기화
    }

    // 유효한 이메일 형식인지 검사하는 메서드
    private boolean isValidEmail(String email) {
        // 정규 표현식을 사용하여 이메일 형식 검증
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(emailRegex);
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }

    // Access Token 갱신 API
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        log.info("Refresh token request received");

        // 쿠키에서 Refresh Token 가져오기
        String refreshToken = tokenProvider.resolveToken(request, "refreshToken");

        // Refresh Token 검증
        if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
            log.info("Valid refresh token found: {}", refreshToken);

            // 새로운 Access Token, CSRF Token 생성
            Authentication auth = tokenProvider.getAuthentication(refreshToken);
            UserDetails userDetails = (UserDetails) auth.getPrincipal(); // UserDetails 타입으로 캐스팅
            String accessToken = tokenProvider.generateAccessToken(userDetails); // 캐스팅된 객체 전달
            String csrfToken = tokenProvider.generateCsrfToken(auth);

            // 응답 헤더에 Access Token, CSRF Token 포함
            response.setHeader("Authorization", "Bearer " + accessToken);
            response.setHeader("X-CSRF-TOKEN", csrfToken);

            // 응답 본문에 Access Token, CSRF Token 포함
            LoginResponse loginResponse = new LoginResponse(accessToken, refreshToken, csrfToken);
            log.info("New access token and CSRF token generated"); // 로그 추가
            return ResponseEntity.ok(new ApiResponse<>(true, "Access token refreshed successfully!", loginResponse));
        } else {
            log.warn("Invalid refresh token provided"); // 로그 추가
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, "Invalid refresh token"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> registerUser(@RequestBody User user) {
        // 이메일 형식 검증
        if (!isValidEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid email format"));
        }
        // 비밀번호 길이 검증
        if (user.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Password must be at least 8 characters long"));
        }
        try {
            if (userService.checkIfUserExist(user.getEmail())) {

                log.warn("Attempt to register with already taken email: {}", user.getEmail());

                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Email is already taken!"));
            }
            userService.registerNewUser(user.getEmail(), user.getPassword());

            log.info("User registered successfully: {}", user.getEmail());

            return ResponseEntity.ok(new ApiResponse<>(true, "User registered successfully!"));
        } catch (Exception e) {

            log.error("Error occurred during registration for email: {}", user.getEmail(), e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "An error occurred during registration: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user, HttpServletResponse response) { // HttpServletResponse 추가
        try {
            log.info("Login attempt for user: {}", user.getEmail());

            // 사용자가 입력한 이메일과 비밀번호로 인증 토큰 생성
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()) // email을 username으로 전달
            );

            // 인증이 성공적으로 이루어지면, SecurityContextHolder에 인증 정보 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 로그인된 사용자 정보 가져오기
            User loggedInUser = userService.getCurrentUser();

            // UserDetails 가져오기
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail()); // email로 조회

            // JWT 토큰 생성 (Access Token)
            String accessToken = tokenProvider.generateAccessToken(userDetails);

            // Refresh Token 생성
            String refreshToken = tokenProvider.generateRefreshToken(userDetails);

            // CSRF Token 생성
            String csrfToken = tokenProvider.generateCsrfToken(authentication);

            // HttpOnly 쿠키에 Refresh Token 저장
            Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
            refreshTokenCookie.setHttpOnly(true); // HttpOnly 속성 설정
            refreshTokenCookie.setPath("/"); // 쿠키 경로 설정
            // 만료 시간 설정 (선택 사항)
            refreshTokenCookie.setMaxAge(60 * 60 * 24 * 7); // 7일 동안 유효한 쿠키
            // 응답에 쿠키 추가
            response.addCookie(refreshTokenCookie);

            // 응답 헤더에 Access Token, CSRF Token 포함
            response.setHeader("Authorization", "Bearer " + accessToken);
            response.setHeader("X-CSRF-TOKEN", csrfToken);

            // 응답 본문에 Access Token, Refresh Token, CSRF Token 포함
            LoginResponse loginResponse = new LoginResponse(accessToken, refreshToken, csrfToken); // 새로운 응답 객체 생성
            return ResponseEntity.ok(new ApiResponse<>(true, "User logged in successfully!", loginResponse));
        } catch (BadCredentialsException e) {
            SecurityContextHolder.clearContext(); // 로그인 실패 시, SecurityContextHolder 초기화
            log.error("Invalid credentials for user: {}", user.getEmail());
            String message = messageSource.getMessage("invalidEmailOrPassword", null, LocaleContextHolder.getLocale());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, message));
        } catch (DisabledException e) {
            log.error("Account disabled for user: {}", user.getEmail());
            String message = messageSource.getMessage("accountDisabled", null, LocaleContextHolder.getLocale());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, message));
        } catch (Exception e) {
            log.error("Error during login for user: {}", user.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, messageSource.getMessage("serverOrNetworkError", null, LocaleContextHolder.getLocale())));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutUser(HttpServletResponse response) { // HttpServletResponse 추가
        // 로그아웃 로직
        SecurityContextHolder.clearContext();

        // 쿠키 제거
        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0); // 쿠키 만료
        response.addCookie(refreshTokenCookie);

        Cookie csrfTokenCookie = new Cookie("csrfToken", null);
        csrfTokenCookie.setHttpOnly(true);
        csrfTokenCookie.setPath("/");
        csrfTokenCookie.setMaxAge(0); // 쿠키 만료
        response.addCookie(csrfTokenCookie);

        log.info("User logged out successfully");

        return ResponseEntity.ok(new ApiResponse<>(true, "User logged out successfully!"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getMyInfo() {
        try {
            User user = userService.getCurrentUser();
            if (user == null) {
                log.warn("User is not logged in");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "User is not logged in"));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "User info fetched successfully", user));
        } catch (Exception e) {
            log.error("Failed to fetch user info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to fetch user info"));
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')") // USER 역할을 가진 사용자만 접근 가능
    public ResponseEntity<ApiResponse<Void>> updateMyInfo(@RequestBody User updatedUser) {
        // 사용자 정보 수정 로직
        try {
            userService.updateCurrentUser(updatedUser);
            log.info("User info updated successfully for email: {}", updatedUser.getEmail());
            return ResponseEntity.ok(new ApiResponse<>(true, "User info updated successfully!"));
        } catch (Exception e) {
            log.error("Failed to update user info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to update user info"));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMyAccount() {
        // 회원 탈퇴 로직
        try {
            userService.deleteCurrentUser();
            log.info("User account deleted successfully");
            return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully!"));
        } catch (Exception e) {
            log.error("Failed to delete user account", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to delete user account"));
        }
    }

    // CSRF Token 검증
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex, HttpServletRequest request) {
        // CSRF Token 검증
        if (ex instanceof AuthenticationException) { // AuthenticationException 사용
            String csrfTokenHeader = request.getHeader("X-CSRF-TOKEN");
            String csrfTokenCookie = tokenProvider.resolveToken(request, "csrfToken");
            if (csrfTokenHeader == null || csrfTokenCookie == null || !csrfTokenHeader.equals(csrfTokenCookie)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(false, "Invalid CSRF token"));
            }
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "An unexpected error occurred."));
    }
}