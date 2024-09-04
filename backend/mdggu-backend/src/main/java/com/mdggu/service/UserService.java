// 사용자 관련 비즈니스 로직
package com.mdggu.service;

import com.mdggu.model.User;
import com.mdggu.model.UserRole;
import com.mdggu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerNewUser(String email, String password) {
        if (checkIfUserExist(email)) {// 이메일 중복 체크
            throw new IllegalArgumentException("Email is already taken!");
        }
        User user = new User();
        user.setUsername(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    public boolean checkIfUserExist(String email) {
        return userRepository.findByEmail(email) != null; // 이메일로 중복 체크
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 인증 정보가 없거나, "anonymousUser"인 경우 로그인되지 않은 것으로 간주
        if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String email = getEmailFromSecurityContext();
        return userRepository.findByEmail(email); // 이메일로 사용자 검색
    }

    public void updateCurrentUser(User updatedUser) {
        User currentUser = getCurrentUser();
        currentUser.setUsername(updatedUser.getUsername());
        currentUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        userRepository.save(currentUser);
    }

    public void deleteCurrentUser() {
        User currentUser = getCurrentUser();
        userRepository.delete(currentUser);
    }

    private String getEmailFromSecurityContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            // TODO: 이메일을 가져오도록 수정
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }
}
