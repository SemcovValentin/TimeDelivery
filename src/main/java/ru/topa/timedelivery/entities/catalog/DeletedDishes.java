package ru.topa.timedelivery.entities.catalog;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "deleted_dishes")
public class DeletedDishes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double price;
    private int weight;
    private String imageUrl;
    private String ingredient;

    @ManyToMany
    @JoinTable(
            name = "deleted_dishes_type_dishes",
            joinColumns = @JoinColumn(name = "deleted_dish_id"),
            inverseJoinColumns = @JoinColumn(name = "type_dish_id")
    )
    private Set<TypeDishes> typeDishes = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "deleted_dishes_types",
            joinColumns = @JoinColumn(name = "deleted_dish_id"),
            inverseJoinColumns = @JoinColumn(name = "type_id")
    )
    private Set<Type> types = new HashSet<>();

    private LocalDateTime deletedAt;

}

