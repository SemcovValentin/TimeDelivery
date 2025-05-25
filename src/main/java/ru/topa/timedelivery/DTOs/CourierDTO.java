package ru.topa.timedelivery.DTOs;

import lombok.Data;

@Data
public class CourierDTO {
    private Long id;
    private String name;

    public CourierDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}
