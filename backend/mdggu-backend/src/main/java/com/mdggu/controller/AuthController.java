// 사용자 인증 관련 API 엔드포인트
package com.mdggu.controller;

import com.mdggu.model.User;
import com.mdggu.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userService.checkIfUserExist(user.getEmail())) { // email 중복 체크
            return ResponseEntity.badRequest().body("Email is already taken!");
        }
        userService.registerNewUser(user.getEmail(), user.getPassword()); // email 사용
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        // 실제 로그인 로직은 Spring Security에서 처리될 예정
        //TODO: 이메일과 비밀번호를 사용하여 사용자를 인증하는 로직 구현
        return ResponseEntity.ok("User logged in successfully!");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // 로그아웃 로직
        return ResponseEntity.ok("User logged out successfully!");
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMyInfo() {
        // 사용자 정보 조회 로직 (현재 로그인된 사용자 정보 반환)
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyInfo(@RequestBody User updatedUser) {
        // 사용자 정보 수정 로직
        userService.updateCurrentUser(updatedUser);
        return ResponseEntity.ok("User info updated successfully!");
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount() {
        // 회원 탈퇴 로직
        userService.deleteCurrentUser();
        return ResponseEntity.ok("User deleted successfully!");
    }
}