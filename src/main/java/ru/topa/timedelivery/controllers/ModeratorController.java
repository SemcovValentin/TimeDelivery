package ru.topa.timedelivery.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.DTOs.ClientDTO;
import ru.topa.timedelivery.DTOs.CourierDTO;
import ru.topa.timedelivery.DTOs.OrderAdminDTO;
import ru.topa.timedelivery.services.OrderService;
import ru.topa.timedelivery.services.UserService;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/moderator")
public class ModeratorController {

    @Autowired
    OrderService orderService;

    @Autowired
    UserService userService;

    @GetMapping("/")
    public String home() {
        return "moderator";
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

    @GetMapping("/orders")
    @ResponseBody
    public ResponseEntity<Page<OrderAdminDTO>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        Page<OrderAdminDTO> ordersPage = orderService.getOrdersPage(page, size, status);
        return ResponseEntity.ok(ordersPage);
    }


    @GetMapping("/clients")
    public ResponseEntity<Page<ClientDTO>> getClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Page<ClientDTO> clientsPage = userService.getClients(page, size, sortBy, direction);
        return ResponseEntity.ok(clientsPage);
    }
}
