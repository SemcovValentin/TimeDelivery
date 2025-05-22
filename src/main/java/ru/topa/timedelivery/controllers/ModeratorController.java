package ru.topa.timedelivery.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.DTOs.CourierDTO;
import ru.topa.timedelivery.DTOs.OrderAdminDTO;
import ru.topa.timedelivery.services.OrderService;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/moderator")
public class ModeratorController {

    @Autowired
    OrderService orderService;

    @GetMapping("/")
    public String home() {
        return "moderator";
    }

    @GetMapping("/orders")
    @ResponseBody
    public List<OrderAdminDTO> getOrders() {
        return orderService.getAllOrdersForAdmin();
    }

    @GetMapping("/couriers")
    @ResponseBody
    public List<CourierDTO> getCouriers() {
        return orderService.getAllCouriers();
    }

    @PostMapping("/orders/{id}/assign-courier")
    public ResponseEntity<?> assignCourier(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long courierId = body.get("courierId");
        try {
            orderService.assignCourier(id, courierId);
            return ResponseEntity.ok(Map.of("message", "Курьер назначен"));
        } catch (EntityNotFoundException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
