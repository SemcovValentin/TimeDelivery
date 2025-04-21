package ru.topa.timedelivery.DTOs;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ClientDTO {

    private String name;
    private String surname;
    private String email;
    private String address;
    private String city;
    private LocalDate birthday;
}
