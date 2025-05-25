package ru.topa.timedelivery.DTOs;

import lombok.Data;
import ru.topa.timedelivery.entities.catalog.Type;
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
    private Set<TypeDishes> typeDishes;
    private Set<Type> types;


    public DishesDTO(String name, double price, int weight, String imageUrl, String ingredient,
                     Set<TypeDishes> typeDishes, Set<Type> types) {
        this.name = name;
        this.price = price;
        this.weight = weight;
        this.imageUrl = imageUrl;
        this.ingredient = ingredient;
        this.typeDishes = typeDishes;
        this.types = types;
    }

}
