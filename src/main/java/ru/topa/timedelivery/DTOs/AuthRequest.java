package ru.topa.timedelivery.DTOs;

import lombok.Data;

import java.util.Set;

@Data
public class AuthRequest {

        private String name;
        private String email;
        private String phone;
        private String password;
        Set<String> roles;

}
