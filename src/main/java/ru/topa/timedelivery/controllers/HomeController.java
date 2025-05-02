package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.repositories.DishesRepository;
import ru.topa.timedelivery.services.HomeService;
import ru.topa.timedelivery.services.TypeDishesService;

import java.util.List;


@Controller
public class HomeController {
    @Autowired
    TypeDishesService typeDishesService;
    @Autowired
    HomeService homeService;

    @Autowired
    DishesRepository dishesRepository;


    @GetMapping("/timeDelivery/")
    public String home(Model model) {
        model.addAttribute("images", homeService.getCarousel());
        model.addAttribute("categories", typeDishesService.getAllCategories());
        return "home";
    }

    @GetMapping("/search")
    public String search(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        return "search";
    }

    @GetMapping("/images")
    @ResponseBody
    public List<String> getImages() {
        return homeService.getCarousel();
    }

    @GetMapping("/catalog")
    @ResponseBody
    public List<Dishes> getAllDishes() {
        return dishesRepository.findAll();
    }

    @GetMapping("/timeDelivery/catalog/")
    public String catalog(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        return "catalog";
    }
    
    @GetMapping("/restaurants")
    public String restaurants(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        return "restaurants";
    }

    @GetMapping("/bonuses")
    public String bonuses(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        return "bonuses";
    }

    @GetMapping("/payment")
    public String payment(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        return "payment";
    }

    @GetMapping("/pickup")
    public String pickup(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        return "pickup";
    }

    @GetMapping("/delivery")
    public String delivery(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        return "delivery";
    }
}
