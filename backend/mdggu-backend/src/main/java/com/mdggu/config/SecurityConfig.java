package com.mdggu.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${python.url}")
    private String pythonUrl;

    @Autowired
    private TokenProvider tokenProvider;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors().configurationSource(corsConfigurationSource())
                .and()
                // CSRF 비활성화: Stateless JWT Bearer 토큰 방식은 세션 쿠키 기반 CSRF 공격에 해당하지 않음.
                // 단, refreshToken HttpOnly 쿠키 사용으로 인한 위험은 SameSite=Strict 설정으로 완화.
                .csrf().disable()
                .httpBasic().disable() // HTTP Basic 인증 비활성화
                .formLogin().disable() // 폼 로그인 비활성화
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 세션 사용 안 함
                .and()
                .authorizeRequests()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // CORS preflight 요청 허용
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Swagger UI 허용
                .requestMatchers("/api/v1/auth/**").permitAll() // 인증 관련 API는 모두 허용
                .requestMatchers("/api/v1/documents/**").authenticated() // 문서 관련 API는 인증 필요
                .requestMatchers(HttpMethod.POST, "/api/v1/optimize").permitAll()   // 에디터 미로그인 최적화 허용
                .requestMatchers("/api/v1/optimize/**").authenticated()             // 문서 저장 최적화는 인증 필요
                // hasRole()은 "ROLE_" prefix를 자동 추가하므로, UserRole enum 값("ADMIN")과 맞추려면 hasAuthority() 사용
                .requestMatchers("/health").hasAuthority("ADMIN")
                .requestMatchers("/status").hasAuthority("ADMIN")
                .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")
                .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                .and()
                .addFilterBefore(new JwtAuthenticationFilter(tokenProvider), UsernamePasswordAuthenticationFilter.class); // JWT 인증 필터 추가

        log.info("SecurityFilterChain configured");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(frontendUrl, pythonUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 허용된 HTTP 메서드 설정
        configuration.setAllowedHeaders(List.of("*")); // 허용된 헤더 설정
        configuration.setAllowCredentials(true); // 자격 증명 허용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 CORS 설정 적용
        return source;
    }
}
