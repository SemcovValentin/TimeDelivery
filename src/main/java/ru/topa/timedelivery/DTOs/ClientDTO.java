package ru.topa.timedelivery.DTOs;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ru.topa.timedelivery.entities.persons.Client;

import java.time.LocalDate;

@Setter
@Getter
@Data
public class ClientDTO {

    private String name;
    private String email;
    private String address;
    private String city;
    private LocalDate birthday;
    private String phone;
    private Long Id;

    public static ClientDTO from(Client client) {
        ClientDTO dto = new ClientDTO();
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setAddress(client.getAddress());
        dto.setCity(client.getCity());
        dto.setBirthday(client.getBirthday());
        if (client.getUser() != null) {
            dto.setPhone(client.getUser().getName());
            dto.setId(client.getUser().getId());
        }
        return dto;
    }


}
