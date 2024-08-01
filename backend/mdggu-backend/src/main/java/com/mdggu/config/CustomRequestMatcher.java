package com.mdggu.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.util.matcher.RequestMatcher;

public class CustomRequestMatcher implements RequestMatcher {
    private final String pattern;

    public CustomRequestMatcher(String pattern) {
        this.pattern = normalizePattern(pattern);
    }

    @Override
    public boolean matches(HttpServletRequest request) {
        String requestURI = normalizePattern(request.getRequestURI());
        return requestURI.matches(pattern);
    }

    private String normalizePattern(String pattern) {
        if (pattern.endsWith("/")) {
            pattern = pattern.substring(0, pattern.length() - 1);
        }
        return pattern;
    }
}