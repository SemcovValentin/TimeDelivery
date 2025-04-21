package ru.topa.timedelivery.entities.catalog;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @Column(nullable = false,columnDefinition = "MONEY")
    private double price;

    @Positive
    @NotNull
    private int weight;

    @NotBlank
    @Column(nullable = false,columnDefinition = "VARCHAR(255)",unique = true)
    private String imageUrl;

    @Column(name = "ingredients",columnDefinition = "TEXT",nullable = false)
    private String ingredient;

    @Column(name = "vegetarian", nullable = false,columnDefinition = "BIT")
    private boolean isVegan;

    @Column(name = "spicy", nullable = false,columnDefinition = "BIT")
    private boolean isSpicy;

    @Column(name = "is_top", nullable = false,columnDefinition = "BIT")
    private boolean isTop;

    @Column(name = "new", nullable = false,columnDefinition = "BIT")
    private boolean isNew;

    @Column(name = "type_deshes",nullable = false,columnDefinition = "VARCHAR(255)")
    private TypeDishes typeDishes;

    public Dishes(String name, double price, int weight, String imageUrl, String ingredient, boolean isVegan, boolean isSpicy, boolean isTop, boolean isNew, TypeDishes typeDishes) {
        this.name = name;
        this.price = price;
        this.weight = weight;
        this.imageUrl = imageUrl;
        this.ingredient = ingredient;
        this.isVegan = isVegan;
        this.isSpicy = isSpicy;
        this.isTop = isTop;
        this.isNew = isNew;
        this.typeDishes = typeDishes;
    }
}
