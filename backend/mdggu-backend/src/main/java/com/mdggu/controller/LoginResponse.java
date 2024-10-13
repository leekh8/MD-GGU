package com.mdggu.controller;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String csrfToken;

    public LoginResponse(String accessToken, String refreshToken, String csrfToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.csrfToken = csrfToken;
    }

    // getter 메서드
    public String getAccessToken() {
        return accessToken;
    }

    public String getrefreshToken() {
        return refreshToken;
    }

    public String getCsrfToken() {
        return csrfToken;
    }
}