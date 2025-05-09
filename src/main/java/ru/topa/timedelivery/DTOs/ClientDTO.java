package ru.topa.timedelivery.DTOs;

import lombok.Data;
import ru.topa.timedelivery.entities.persons.Client;

import java.time.LocalDate;

@Data
public class ClientDTO {

    private String name;
    private String email;
    private String address;
    private String city;
    private LocalDate birthday;

    public static ClientDTO from(Client client) {
        ClientDTO dto = new ClientDTO();
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setAddress(client.getAddress());
        dto.setCity(client.getCity());
        dto.setBirthday(client.getBirthday());
        return dto;
    }
}
