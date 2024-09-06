// 사용자 인증 관련 API 엔드포인트
package com.mdggu.controller;

import com.mdggu.model.User;
import com.mdggu.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MessageSource messageSource;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> registerUser(@RequestBody User user) {
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
    public ResponseEntity<ApiResponse<User>> loginUser(@RequestBody User user) {
        try {
            // 실제 로그인 로직은 Spring Security에서 처리될 예정
            // Spring Security를 사용하여 로그인 시도 (구체적인 구현은 Spring Security 설정에 따라 다름)
            log.info("Login attempt for user: {}", user.getEmail());

            // TODO: 로그인 성공 후 사용자에게 필요한 정보(예: JWT 토큰, 사용자 정보 등)를 함께 제공하도록 수정
            User loggedInUser = userService.getCurrentUser(); // 로그인된 사용자 정보 가져오기

            return ResponseEntity.ok(new ApiResponse<>(true, "User logged in successfully!", loggedInUser));
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
    public ResponseEntity<ApiResponse<Void>> logoutUser() {
        // 로그아웃 로직
        SecurityContextHolder.clearContext();

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

    @ControllerAdvice
    public class GlobalExceptionHandler {

        @Autowired
        private MessageSource messageSource;

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
            SecurityContextHolder.clearContext();
            String message = messageSource.getMessage("invalidEmailOrPassword", null, LocaleContextHolder.getLocale());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, message));
        }

        @ExceptionHandler(DisabledException.class)
        public ResponseEntity<ApiResponse<Void>> handleDisabledException(DisabledException ex) {
            String message = messageSource.getMessage("accountDisabled", null, LocaleContextHolder.getLocale());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, message));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "An unexpected error occurred."));
        }
    }
}