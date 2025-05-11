package ru.topa.timedelivery.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/courier")
public class CourierController {

    @GetMapping("/")
    public String home() {
        return "courier";
    }
}
