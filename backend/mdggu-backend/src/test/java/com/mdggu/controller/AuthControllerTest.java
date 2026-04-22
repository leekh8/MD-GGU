package com.mdggu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mdggu.config.JwtAuthenticationFilter;
import com.mdggu.config.TokenProvider;
import com.mdggu.model.User;
import com.mdggu.model.UserRole;
import com.mdggu.service.CustomUserDetailsService;
import com.mdggu.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController 통합 테스트")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean UserService userService;
    @MockBean TokenProvider tokenProvider;
    @MockBean AuthenticationManager authenticationManager;
    @MockBean MessageSource messageSource;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;

    // ── 회원가입 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /register - 정상 가입")
    void register_success() throws Exception {
        given(userService.checkIfUserExist(anyString())).willReturn(false);

        User newUser = new User();
        newUser.setEmail("new@example.com");
        newUser.setRole(UserRole.USER);
        given(userService.registerNewUser(anyString(), anyString())).willReturn(newUser);

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "new@example.com", "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /register - 중복 이메일")
    void register_duplicateEmail_badRequest() throws Exception {
        given(userService.checkIfUserExist("dupe@example.com")).willReturn(true);

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "dupe@example.com", "password", "password123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /register - 비밀번호 8자 미만")
    void register_shortPassword_badRequest() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "test@example.com", "password", "short"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── 로그인 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /login - 정상 로그인 시 토큰 반환")
    void login_success() throws Exception {
        var authToken = new UsernamePasswordAuthenticationToken(
                "test@example.com", null,
                List.of(new SimpleGrantedAuthority("USER")));
        given(authenticationManager.authenticate(any())).willReturn(authToken);

        User loggedIn = new User();
        loggedIn.setEmail("test@example.com");
        given(userService.getCurrentUser()).willReturn(loggedIn);

        var userDetails = new org.springframework.security.core.userdetails.User(
                "test@example.com", "", List.of(new SimpleGrantedAuthority("USER")));
        given(customUserDetailsService.loadUserByUsername("test@example.com")).willReturn(userDetails);
        given(tokenProvider.generateAccessToken(any())).willReturn("access.token.here");
        given(tokenProvider.generateRefreshToken(any())).willReturn("refresh.token.here");
        given(tokenProvider.generateCsrfToken(any())).willReturn("csrf-token");

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "test@example.com", "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access.token.here"));
    }

    @Test
    @DisplayName("POST /login - 잘못된 자격증명")
    void login_badCredentials_unauthorized() throws Exception {
        given(authenticationManager.authenticate(any()))
                .willThrow(new BadCredentialsException("bad credentials"));
        given(messageSource.getMessage(anyString(), any(), any())).willReturn("이메일 또는 비밀번호가 올바르지 않습니다.");

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "test@example.com", "password", "wrong"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── 내 정보 조회 ─────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "test@example.com", authorities = "USER")
    @DisplayName("GET /me - 인증된 사용자 정보 반환")
    void getMyInfo_authenticated_returnsUser() throws Exception {
        User user = new User();
        user.setEmail("test@example.com");
        user.setUsername("testuser");
        given(userService.getCurrentUser()).willReturn(user);

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));
    }
}
