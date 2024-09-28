package com.mdggu.service;

import com.mdggu.config.CustomUserDetails;
import com.mdggu.model.User;
import com.mdggu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username); // username으로 사용자 조회
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return new CustomUserDetails(user); // UserDetails 구현체 반환
    }
}