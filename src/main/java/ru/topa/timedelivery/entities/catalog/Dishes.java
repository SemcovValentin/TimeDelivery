package ru.topa.timedelivery.entities.catalog;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.topa.timedelivery.entities.orders.OrderItem;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "dishes")
@AllArgsConstructor
@NoArgsConstructor
public class Dishes {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false,columnDefinition = "NVARCHAR(255)",unique = true)
    private String name;

    @Positive
    @Column(nullable = false, columnDefinition = "DECIMAL(10,2)")
    private double price;

    @Positive
    @NotNull
    private int weight;

    @NotBlank
    @Column(nullable = false,columnDefinition = "VARCHAR(255)",unique = true)
    private String imageUrl;

    @Column(name = "ingredients",columnDefinition = "TEXT",nullable = false)
    private String ingredient;

    @OneToMany(mappedBy = "dish")
    @JsonBackReference
    private Set<OrderItem> orderItems;


    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "dish_categories",
            joinColumns = @JoinColumn(name = "dish_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    private Set<TypeDishes> typeDishes = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "dish_type",
            joinColumns = @JoinColumn(name = "dish_id"),
            inverseJoinColumns = @JoinColumn(name = "type_id"))
    private Set<Type> types;

    public Dishes(String name, double price, int weight, String imageUrl, String ingredient, Set<TypeDishes> typeDishes, Set<Type> types) {
        this.name = name;
        this.price = price;
        this.weight = weight;
        this.imageUrl = imageUrl;
        this.ingredient = ingredient;
        this.typeDishes = typeDishes;
        this.types = types;
    }
}
