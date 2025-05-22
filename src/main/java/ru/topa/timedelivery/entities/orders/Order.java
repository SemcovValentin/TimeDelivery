package ru.topa.timedelivery.entities.orders;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.topa.timedelivery.entities.persons.User;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "orders")
@Data
@EqualsAndHashCode(exclude = {"orderItems", "user"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "time_order",nullable = false,columnDefinition = "DATETIME")
    private LocalDateTime createdAt;

    private String status;

    @Column(name = "comment", columnDefinition = "TEXT") //
    private String comment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonManagedReference
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<OrderItem> orderItems = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "courier_id")
    @JsonManagedReference
    private User courier;

}
