package ru.topa.timedelivery.DTOs;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long id;
    private Long dishId;
    private String dishName;
    private Integer quantity;
    private double price;

}
