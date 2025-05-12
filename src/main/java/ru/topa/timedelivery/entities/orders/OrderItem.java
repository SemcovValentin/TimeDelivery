package ru.topa.timedelivery.entities.orders;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.topa.timedelivery.entities.catalog.Dishes;


@Entity
@Data
@EqualsAndHashCode(exclude = {"order", "dish"})
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private Order order;

    @ManyToOne
    @JoinColumn(name = "dish_id", nullable = false)
    private Dishes dish;


    @Positive
    private Integer quantity;

    @Positive
    @Column(nullable = false, columnDefinition = "DECIMAL(10,2)")
    private double price;

}
