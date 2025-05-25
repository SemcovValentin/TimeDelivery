package ru.topa.timedelivery.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OrderAdminDTO {
    private Long id;
    private String status;
    private LocalDateTime createdAt;
    private ClientDTO client;
    private Long courierId;
    private String courierName;
    private BigDecimal totalAmount;
    private String comment;


}

