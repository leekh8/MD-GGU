package com.mdggu.controller;

public class LoginResponse {
    private String accessToken;
    private String csrfToken;

    public LoginResponse(String accessToken, String csrfToken) {
        this.accessToken = accessToken;
        this.csrfToken = csrfToken;
    }

    // getter 메서드
    public String getAccessToken() {
        return accessToken;
    }

    public String getCsrfToken() {
        return csrfToken;
    }
}