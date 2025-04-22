package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.repositories.DishesRepository;
import ru.topa.timedelivery.services.HomeService;

import java.util.List;


@Controller
public class HomeController {
    @Autowired
    HomeService homeService;

    @Autowired
    DishesRepository dishesRepository;


    @GetMapping("/timeDelivery/")
    public String home(Model model) {
        model.addAttribute("images", homeService.getCarousel());
        return "home";
    }

    @GetMapping("/search")
    public String search(Model model) {
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

}
