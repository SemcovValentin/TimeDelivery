package ru.topa.timedelivery.DTOs;

import lombok.Data;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.catalog.TypeDishes;

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
    private TypeDishes typeDishes;

    private Dishes getDishes(){
        Dishes dishes = new Dishes();
        dishes.setName(name);
        dishes.setPrice(price);
        dishes.setWeight(weight);
        dishes.setImageUrl(imageUrl);
        dishes.setIngredient(ingredient);
        dishes.setVegan(isVegan);
        dishes.setSpicy(isSpicy);
        dishes.setTop(isTop);
        dishes.setNew(isNew);
        dishes.setTypeDishes(typeDishes);
        return dishes;
    }
}
