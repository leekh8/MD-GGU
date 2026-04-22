package com.mdggu.service;

import com.mdggu.model.User;
import com.mdggu.model.UserRole;
import com.mdggu.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService 단위 테스트")
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @InjectMocks UserService userService;

    @BeforeEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // ── 회원가입 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("신규 사용자 등록 성공")
    void registerNewUser_success() {
        given(userRepository.findByEmail("test@example.com")).willReturn(null);
        given(userRepository.findByUsername(anyString())).willReturn(null);
        given(passwordEncoder.encode("password123")).willReturn("encoded");

        User saved = new User();
        saved.setEmail("test@example.com");
        saved.setRole(UserRole.USER);
        given(userRepository.save(any(User.class))).willReturn(saved);

        User result = userService.registerNewUser("test@example.com", "password123");

        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getRole()).isEqualTo(UserRole.USER);
        then(passwordEncoder).should().encode("password123");
    }

    @Test
    @DisplayName("이미 사용 중인 이메일로 가입 시 예외 발생")
    void registerNewUser_duplicateEmail_throws() {
        User existing = new User();
        existing.setEmail("test@example.com");
        given(userRepository.findByEmail("test@example.com")).willReturn(existing);

        assertThatThrownBy(() -> userService.registerNewUser("test@example.com", "password123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already taken");
    }

    // ── 사용자 정보 수정 ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("비밀번호 미입력 시 기존 비밀번호 유지")
    void updateCurrentUser_emptyPassword_keepsExisting() {
        // SecurityContext에 인증 정보 세팅
        Authentication auth = mock(Authentication.class);
        given(auth.isAuthenticated()).willReturn(true);
        given(auth.getName()).willReturn("test@example.com");
        SecurityContext ctx = mock(SecurityContext.class);
        given(ctx.getAuthentication()).willReturn(auth);
        SecurityContextHolder.setContext(ctx);

        User current = new User();
        current.setEmail("test@example.com");
        current.setUsername("oldNick");
        current.setPassword("existingHash");
        given(userRepository.findByEmail("test@example.com")).willReturn(current);
        given(userRepository.findByUsername("newNick")).willReturn(null);
        given(userRepository.save(any())).willReturn(current);

        User updated = new User();
        updated.setEmail("test@example.com");
        updated.setUsername("newNick");
        updated.setPassword(""); // 빈 비밀번호

        userService.updateCurrentUser(updated);

        // 비밀번호 인코딩이 호출되지 않아야 함
        then(passwordEncoder).should(never()).encode(anyString());
    }

    @Test
    @DisplayName("중복 닉네임으로 수정 시 예외 발생")
    void updateCurrentUser_duplicateUsername_throws() {
        Authentication auth = mock(Authentication.class);
        given(auth.isAuthenticated()).willReturn(true);
        given(auth.getName()).willReturn("test@example.com");
        SecurityContext ctx = mock(SecurityContext.class);
        given(ctx.getAuthentication()).willReturn(auth);
        SecurityContextHolder.setContext(ctx);

        User current = new User();
        current.setEmail("test@example.com");
        current.setUsername("myNick");
        given(userRepository.findByEmail("test@example.com")).willReturn(current);

        User otherUser = new User();
        otherUser.setUsername("takenNick");
        given(userRepository.findByUsername("takenNick")).willReturn(otherUser);

        User updated = new User();
        updated.setEmail("test@example.com");
        updated.setUsername("takenNick");

        assertThatThrownBy(() -> userService.updateCurrentUser(updated))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already taken");
    }

    // ── 인증 미처리 ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("미인증 상태에서 getCurrentUser 호출 시 예외 발생")
    void getCurrentUser_notAuthenticated_throws() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(() -> userService.getCurrentUser())
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }
}
