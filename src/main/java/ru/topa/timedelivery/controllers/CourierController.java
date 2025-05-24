package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import ru.topa.timedelivery.DTOs.OrderAdminDTO;
import ru.topa.timedelivery.services.OrderService;

import java.util.List;

@Controller
@RequestMapping("/courier")
public class CourierController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/")
    public String home() {
        return "courier";
    }

    @GetMapping("/{courierId}/orders")
    public ResponseEntity<List<OrderAdminDTO>> getOrdersByCourier(
            @PathVariable Long courierId,
            @RequestParam(required = false) String status) {
        List<OrderAdminDTO> orders;
        if (status == null || status.isEmpty()) {
            orders = orderService.getOrdersByCourierId(courierId);
        } else {
            orders = orderService.getOrdersByCourierIdAndStatus(courierId, status);
        }
        return ResponseEntity.ok(orders);
    }




}
