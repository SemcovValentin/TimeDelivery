package ru.topa.timedelivery.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OrderAdminDTO {
    private Long id;
    private String status;
    private LocalDateTime createdAt;
    private String userName;
    private Long courierId;
    private String courierName;
}

