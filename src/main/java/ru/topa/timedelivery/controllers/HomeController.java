package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.catalog.Type;
import ru.topa.timedelivery.repositories.DishesRepository;
import ru.topa.timedelivery.services.HomeService;
import ru.topa.timedelivery.services.TypeDishesService;
import ru.topa.timedelivery.services.TypeService;

import java.util.List;


@Controller
@RequestMapping("/timeDelivery")
public class HomeController {
    @Autowired
    TypeDishesService typeDishesService;
    @Autowired
    HomeService homeService;
    @Autowired
    DishesRepository dishesRepository;
    @Autowired
    TypeService typeService;

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("images", homeService.getCarousel());
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
        return "home";
    }

    @GetMapping("/search")
    public String search(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
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

    @GetMapping("/catalogs/")
    public String catalog(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
        return "catalog";
    }
    
    @GetMapping("/restaurants")
    public String restaurants(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
        return "restaurants";
    }

    @GetMapping("/bonuses")
    public String bonuses(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
        return "bonuses";
    }

    @GetMapping("/payment")
    public String payment(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
        return "payment";
    }

    @GetMapping("/pickup")
    public String pickup(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
        return "pickup";
    }

    @GetMapping("/delivery")
    public String delivery(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
        return "delivery";
    }

    @GetMapping("/user")
    public String userPage(Model model) {
        model.addAttribute("categories", typeDishesService.getAllCategories());
        List<Type> types = typeService.getAllTypes();
        model.addAttribute("types", types);
        return "user";
    }
}
