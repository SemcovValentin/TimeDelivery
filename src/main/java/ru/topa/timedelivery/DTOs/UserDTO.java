package ru.topa.timedelivery.DTOs;


import lombok.Data;

@Data
public class UserDTO {

    private Long id;
    private String phone;
    private String password;
    private String currentPassword;
    private String newPassword;

}
