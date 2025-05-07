package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.services.DishesService;
import ru.topa.timedelivery.services.TypeDishesService;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    DishesService dishesService;
    @Autowired
    private TypeDishesService service;


    @GetMapping("/")
    public String home() {
        return "admin";
    }


    @GetMapping("/addAll")
    public String addAll() {
        service.addAllCategories();
        dishesService.addAllDishes();
        return "all dishas is added";
    }

    @GetMapping
    public List<TypeDishes> getAll() {
        return service.getAllCategories();
    }

    @PostMapping
    public TypeDishes add(@RequestBody Map<String, String> body) {
        return service.addCategory(body.get("name"));
    }

    @PostMapping("/create/dishes")
    public Dishes createDish(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        double price = (Double) request.get("price");
        int weight = (Integer) request.get("weight");
        String imageUrl = (String) request.get("imageUrl");
        String ingredient = (String) request.get("ingredient");
        boolean isVegan = (Boolean) request.get("isVegan");
        boolean isSpicy = (Boolean) request.get("isSpicy");
        boolean isTop = (Boolean) request.get("isTop");
        boolean isNew = (Boolean) request.get("isNew");
        List<String> categoryNames = (List<String>) request.get("categoryNames");

        return dishesService.createDish(name, price, weight, imageUrl, ingredient, isVegan, isSpicy, isTop, isNew, categoryNames);
    }
}
