// 사용자 관련 비즈니스 로직
package com.mdggu.service;

import com.mdggu.controller.AuthController;
import com.mdggu.model.User;
import com.mdggu.model.UserRole;
import com.mdggu.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerNewUser(String email, String password) {
        log.debug("Attempting to register new user with email: {}", email); // 등록 시도 로그 (DEBUG 레벨)

        if (checkIfUserExist(email)) { // 이메일 중복 체크
            log.warn("Registration failed: Email {} is already taken!", email); // 등록 실패 로그 (WARN 레벨)
            throw new IllegalArgumentException("Email is already taken!");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.USER);

        // 사용자 이름 생성 로직 추가
        String username = generateUsername(email);
        user.setUsername(username);

        log.info("New user registered with email: {} and username: {}", email, username); // 등록 성공 로그 (INFO 레벨)

        return userRepository.save(user);
    }

    public boolean checkIfUserExist(String email) {
        log.debug("Checking if user with email {} exists", email); // 사용자 존재 여부 확인 로그 (DEBUG 레벨)
        return userRepository.findByEmail(email) != null; // 이메일로 중복 체크
    }

    private String generateUsername(String email) {
        String[] parts = email.split("@");
        String baseUsername = parts[0]; // 이메일의 로컬 부분을 기본 사용자 이름으로 사용

        // 중복 체크 및 고유한 사용자 이름 생성
        String username = baseUsername;
        int count = 1;
        while (userRepository.findByUsername(username) != null) {
            username = baseUsername + count;
            count++;
        }

        log.debug("Generated username {} for email {}", username, email); // 생성된 사용자 이름 로그 (DEBUG 레벨)
        return username;
    }

    public User getCurrentUser() {
        String email = getEmailFromSecurityContext();
        if (email == null) {
            log.warn("getCurrentUser() called but no authenticated user found"); // 인증되지 않은 사용자 접근 시도 로그 (WARN 레벨)
            throw new AuthenticationCredentialsNotFoundException("User is not authenticated");
        }
        log.debug("Fetching current user with email: {}", email); // 현재 사용자 정보 조회 로그 (DEBUG 레벨)
        return userRepository.findByEmail(email);
    }

    public void updateCurrentUser(User updatedUser) {
        log.debug("Attempting to update current user with data: {}", updatedUser); // 사용자 정보 업데이트 시도 로그 (DEBUG 레벨)
        User currentUser = getCurrentUser();
        String newEmail = updatedUser.getEmail();

        if (!currentUser.getEmail().equals(newEmail) && checkIfUserExist(newEmail)) {
            throw new IllegalArgumentException("Email is already taken!");
        }

        currentUser.setEmail(newEmail);
        currentUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        userRepository.save(currentUser);
        log.info("User info updated successfully for email: {}", updatedUser.getEmail());
    }

    public void deleteCurrentUser() {
        User currentUser = getCurrentUser();
        log.info("Deleting user account: {}", currentUser.getEmail()); // 사용자 계정 삭제 로그 (INFO 레벨)
        userRepository.delete(currentUser);
    }

    private String getEmailFromSecurityContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
            return null; // 또는 예외 처리
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername(); // Spring Security 설정에 따라 username이 email일 수 있음
//        } else if (principal instanceof OAuth2User) {
//            // OAuth2User의 경우 이메일을 가져오는 로직 추가
//            Map<String, Object> attributes = ((OAuth2User) principal).getAttributes();
//            return (String) attributes.get("email"); // 또는 설정에 따른 다른 필드를 사용
        } else {
            // 다른 인증 방식을 사용하는 경우 처리
            throw new RuntimeException("User not found");
        }
    }
}