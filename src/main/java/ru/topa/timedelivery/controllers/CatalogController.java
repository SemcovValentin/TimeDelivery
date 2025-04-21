package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.repositories.DishesRepository;

import java.util.List;
import java.util.stream.Collectors;

import static ru.topa.timedelivery.entities.catalog.TypeDishes.*;

@Controller
public class CatalogController {

    @Autowired
    DishesRepository dishesRepository;

    @GetMapping("/timeDelivery/catalog/")
    public String catalog(Model model) {
        return "catalog";
    }

    @GetMapping("/timeDelivery/catalog/pizza")
    @ResponseBody
    public List<Dishes> getPizzas() {
        return dishesRepository.findAll()
                .stream()
                .filter(dish -> dish.getTypeDishes() == PIZZA)
                .collect(Collectors.toList());
    }

    @GetMapping("/timeDelivery/catalog/rolls")
    @ResponseBody
    public List<Dishes> getRolls() {
        return dishesRepository.findAll()
                .stream()
                .filter(dish -> dish.getTypeDishes() == ROLLS)
                .collect(Collectors.toList());
    }

    @GetMapping("/timeDelivery/catalog/burgers")
    @ResponseBody
    public List<Dishes> getBurgers() {
        return dishesRepository.findAll()
                .stream()
                .filter(dish -> dish.getTypeDishes() == BURGER)
                .collect(Collectors.toList());
    }

    @GetMapping("/timeDelivery/catalog/salad")
    @ResponseBody
    public List<Dishes> getSalads() {
        return dishesRepository.findAll()
                .stream()
                .filter(dish -> dish.getTypeDishes() == SALAD)
                .collect(Collectors.toList());
    }

    @GetMapping("/timeDelivery/catalog/wok")
    @ResponseBody
    public List<Dishes> getWok() {
        return dishesRepository.findAll()
                .stream()
                .filter(dish -> dish.getTypeDishes() == WOK)
                .collect(Collectors.toList());
    }


}
