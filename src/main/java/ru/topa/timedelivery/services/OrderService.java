package ru.topa.timedelivery.services;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.DTOs.OrderDTO;
import ru.topa.timedelivery.DTOs.OrderItemDTO;
import ru.topa.timedelivery.DTOs.OrderResponseDTO;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.orders.Order;
import ru.topa.timedelivery.entities.orders.OrderItem;
import ru.topa.timedelivery.entities.orders.OrderRequest;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.DishesRepository;
import ru.topa.timedelivery.repositories.OrderItemRepository;
import ru.topa.timedelivery.repositories.OrderRepository;
import ru.topa.timedelivery.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private DishesRepository dishRepository;
    @Autowired
    private UserRepository userRepository;

    public OrderDTO toOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setComment(order.getComment());

        List<OrderItemDTO> items = order.getOrderItems().stream()
                .map(this::toOrderItemDTO)
                .collect(Collectors.toList());
        dto.setItems(items);

        return dto;
    }

    public OrderItemDTO toOrderItemDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setDishId(item.getDish().getId());
        dto.setDishName(item.getDish().getName());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        return dto;
    }

    public Order findByIdAndUser(String username, Long orderId) {
        return orderRepository.findByIdAndUserName(orderId, username)
                .orElse(null);
    }

    public List<Order> findAllByUser(String phone) {
        return orderRepository.findAllByUserName(phone);
    }

    public OrderResponseDTO toOrderResponseDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderItemDTO> originalItems = order.getOrderItems().stream()
                .map(this::toOrderItemDTO)
                .collect(Collectors.toList());

        // Глубокое копирование, если OrderItemDTO содержит коллекции
        List<OrderItemDTO> safeItems = new ArrayList<>();
        for (OrderItemDTO item : originalItems) {
            OrderItemDTO copy = new OrderItemDTO();
            copy.setId(item.getId());
            copy.setDishId(item.getDishId());
            copy.setDishName(item.getDishName());
            copy.setQuantity(item.getQuantity());
            copy.setPrice(item.getPrice());
            safeItems.add(copy);
        }

        dto.setItems(safeItems);
        return dto;
    }

    @Transactional
    public Order createOrder(OrderRequest request, String username) {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("NEW");
        order.setComment(request.getComment());

        List<OrderItem> items = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : request.getItems().entrySet()) {
            Long dishId = Long.valueOf(entry.getKey());
            Integer quantity = entry.getValue();

            if (quantity == null || quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be positive");
            }

            Dishes dish = dishRepository.findById(dishId)
                    .orElseThrow(() -> new RuntimeException("Dish not found"));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setDish(dish);
            item.setQuantity(quantity);
            item.setPrice(dish.getPrice());
            items.add(item);
        }

        // Добавляем все элементы в заказ ДО сохранения
        order.getOrderItems().addAll(items);

        // Сохраняем заказ вместе с элементами (cascade = ALL)
        order = orderRepository.save(order);

        return order;
    }

}
