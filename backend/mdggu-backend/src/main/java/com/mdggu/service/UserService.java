// 사용자 관련 비즈니스 로직
package com.mdggu.service;

import com.mdggu.model.User;
import com.mdggu.model.UserRole;
import com.mdggu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    public User registerNewUser(String username, String password) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    public boolean checkIfUserExist(String username) {
        return userRepository.findByUsername(username) != null;
    }

    public User getCurrentUser() {
        String username = getUsernameFromSecurityContext();
        return userRepository.findByUsername(username);
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

    private String getUsernameFromSecurityContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }
}
