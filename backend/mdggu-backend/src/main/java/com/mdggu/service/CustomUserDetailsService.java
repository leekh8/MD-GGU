package com.mdggu.service;

import com.mdggu.config.CustomUserDetails;
import com.mdggu.controller.AuthController;
import com.mdggu.model.User;
import com.mdggu.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException { // username을 email로 사용
        log.debug("Loading user details for email: {}", email);
        User user = userRepository.findByEmail(email); // email로 사용자 조회
        if (user == null) {
            log.warn("User not found with email: {}", email);
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        log.debug("User details loaded successfully for email: {}", email);
        return new CustomUserDetails(user);
    }
}