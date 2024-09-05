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
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            if (userService.checkIfUserExist(user.getEmail())) {
                log.warn("Attempt to register with already taken email: {}", user.getEmail());
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Email is already taken!"));
            }
            userService.registerNewUser(user.getEmail(), user.getPassword());
            log.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok(new ApiResponse(true, "User registered successfully!"));
        } catch (Exception e) {
            log.error("Error occurred during registration for email: {}", user.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "An error occurred during registration: " + e.getMessage()));
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        try {
            // 실제 로그인 로직은 Spring Security에서 처리될 예정
            log.info("Login attempt for user: {}", user.getEmail());
            // Spring Security를 사용하여 로그인 시도 (구체적인 구현은 Spring Security 설정에 따라 다름)
            //TODO: 이메일과 비밀번호를 사용하여 사용자를 인증하는 로직 구현
//            Authentication authentication = authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
//            );
//            SecurityContextHolder.getContext().setAuthentication(authentication);  // 로그인 성공 시

            log.info("Login successful for user: {}", user.getEmail());
            // TODO: 로그인 성공 후 사용자에게 필요한 정보(예: JWT 토큰, 사용자 정보 등)를 함께 제공하도록 수정
            return ResponseEntity.ok("User logged in successfully!");

        } catch (BadCredentialsException e) {
            SecurityContextHolder.clearContext(); // 로그인 실패 시, SecurityContextHolder 초기화
            log.error("Invalid credentials for user: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(messageSource.getMessage("invalidEmailOrPassword", null, LocaleContextHolder.getLocale()));
        } catch (DisabledException e) {
            log.error("Account disabled for user: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(messageSource.getMessage("accountDisabled", null, LocaleContextHolder.getLocale()));
        } catch (Exception e) {
            log.error("Error during login for user: {}", user.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(messageSource.getMessage("serverOrNetworkError", null, LocaleContextHolder.getLocale()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // 로그아웃 로직
        SecurityContextHolder.clearContext();
        log.info("User logged out successfully");
        return ResponseEntity.ok("User logged out successfully!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo() {
        try {
            User user = userService.getCurrentUser();
            if (user == null) {
                log.warn("User is not logged in");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User is not logged in");
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Failed to fetch user info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch user info");
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyInfo(@RequestBody User updatedUser) {
        // 사용자 정보 수정 로직
        userService.updateCurrentUser(updatedUser);
        log.info("User info updated successfully for email: {}", updatedUser.getEmail());
        return ResponseEntity.ok("User info updated successfully!");
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount() {
        // 회원 탈퇴 로직
        userService.deleteCurrentUser();
        log.info("User account deleted successfully");
        return ResponseEntity.ok("User deleted successfully!");
    }
}