package ru.topa.timedelivery.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.DTOs.OrderDTO;
import ru.topa.timedelivery.DTOs.OrderItemDTO;
import ru.topa.timedelivery.DTOs.OrderResponseDTO;
import ru.topa.timedelivery.entities.orders.Order;
import ru.topa.timedelivery.entities.orders.OrderRequest;
import ru.topa.timedelivery.services.OrderService;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/timeDelivery/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long orderId, Principal principal) {
        Order order = orderService.findByIdAndUser(principal.getName(), orderId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        OrderDTO dto = orderService.toOrderDTO(order);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Пользователь не авторизован"));
        }
        try {
            Order order = orderService.createOrder(request, principal.getName());
            OrderResponseDTO dto = orderService.toOrderResponseDTO(order);

            List<OrderItemDTO> safeItems = new ArrayList<>(dto.getItems());
            dto.setItems(safeItems);
            log.info("Заказ сформирован с id: {}", order.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Ошибка при создании заказа", e);
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage() != null ? e.getMessage() : "Неизвестная ошибка");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    @GetMapping("/userOrders")
    public ResponseEntity<List<OrderDTO>> getUserOrders(Principal principal) {
        List<Order> orders = orderService.findAllByUser(principal.getName());
        List<OrderDTO> dtos = orders.stream()
                .map(orderService::toOrderDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }


}
