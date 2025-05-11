package ru.topa.timedelivery.DTOs;

import lombok.Data;

import java.util.Set;

@Data
public class AuthResponse {
    private String token;
    private String username;
    private Set<String> roles;

    public AuthResponse(String token, String username, Set<String> roles) {
        this.token = token;
        this.username = username;
        this.roles = roles;
    }

    public AuthResponse() {
    }
}