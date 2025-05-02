package ru.topa.timedelivery.DTOs;

import lombok.Data;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.catalog.TypeDishes;

import java.util.Set;

@Data
public class DishesDTO {

    private Long id;
    private String name;
    private double price;
    private int weight;
    private String imageUrl;
    private String ingredient;
    private boolean isVegan;
    private boolean isSpicy;
    private boolean isTop;
    private boolean isNew;
    private Set<TypeDishes> typeDishes; // Изменили тип на Set


    public DishesDTO(String name, double price, int weight, String imageUrl, String ingredient,
                     boolean isVegan, boolean isSpicy, boolean isTop, boolean isNew,
                     Set<TypeDishes> typeDishes) {
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

    // Метод для преобразования DTO в Entity
    public Dishes toEntity() {
        return new Dishes(name, price, weight, imageUrl, ingredient, isVegan, isSpicy, isTop, isNew, typeDishes);
    }
}
