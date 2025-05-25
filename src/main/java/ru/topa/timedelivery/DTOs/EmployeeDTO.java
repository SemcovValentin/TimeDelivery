package ru.topa.timedelivery.DTOs;

import lombok.Data;
import ru.topa.timedelivery.entities.persons.Role;
import ru.topa.timedelivery.entities.persons.User;

import java.util.Set;
import java.util.stream.Collectors;

@Data
public class EmployeeDTO {
    private Long id;
    private String phone;
    private Set<String> roles;
    private String name;
    private String email;

    public static EmployeeDTO from(User user) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(user.getId());
        dto.setPhone(user.getName());
        dto.setRoles(user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()));

        if (user.getClient() != null) {
            dto.setName(user.getClient().getName());
            dto.setEmail(user.getClient().getEmail());
        }
        return dto;
    }
}
