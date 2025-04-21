package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.topa.timedelivery.services.DishesService;


@RestController
@RequestMapping("/timeDelivery/admin")
public class AdminController {
    @Autowired
    DishesService dishesService;


    @GetMapping("/")
    public String home() {
        return "admin";
    }

    @GetMapping("/addAll")
    public String addAll() {
        dishesService.addAllDishes();
        return "all dishas is added";
    }
}
