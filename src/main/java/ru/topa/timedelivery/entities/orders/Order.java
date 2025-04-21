package ru.topa.timedelivery.entities.orders;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "time_order",nullable = false,columnDefinition = "DATETIME")
    private LocalDateTime orderDate;
}
