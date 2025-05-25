package ru.topa.timedelivery.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.DTOs.*;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.orders.Order;
import ru.topa.timedelivery.entities.orders.OrderItem;
import ru.topa.timedelivery.entities.orders.OrderRequest;
import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.*;

import java.math.BigDecimal;
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
    @Autowired
    private ClientRepository clientRepository;

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

        Client client = clientRepository.findByUser(user)
                .orElseGet(() -> {
                    Client newClient = new Client();
                    newClient.setPhone(user.getName());
                    return clientRepository.save(newClient);
                });

        order.setClient(client);

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

        order.getOrderItems().addAll(items);

        BigDecimal totalAmount = items.stream()
                .map(item -> BigDecimal.valueOf(item.getPrice()).multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(totalAmount);

        order = orderRepository.save(order);

        return order;
    }

    public Page<OrderAdminDTO> getOrdersPage(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Order> ordersPage;

        if (status == null || status.isEmpty()) {
            ordersPage = orderRepository.findAll(pageable);
        } else {
            ordersPage = orderRepository.findByStatus(status, pageable);
        }

        return ordersPage.map(order -> {
            ClientDTO clientDTO = null;
            if (order.getClient() != null) {
                clientDTO = ClientDTO.from(order.getClient());
            }

            Long courierId = order.getCourier() != null ? order.getCourier().getId() : null;
            String courierName = order.getCourier() != null ? order.getCourier().getName() : null;

            return new OrderAdminDTO(
                    order.getId(),
                    order.getStatus(),
                    order.getCreatedAt(),
                    clientDTO,
                    courierId,
                    courierName,
                    order.getTotalAmount(),
                    order.getComment()
            );
        });
    }

    public List<CourierDTO> getAllCouriers() {
        List<User> couriers = userRepository.findAllByRoles_Name("ROLE_COURIER");
        return couriers.stream()
                .map(u -> {
                    String clientName = (u.getClient() != null && u.getClient().getName() != null)
                            ? u.getClient().getName()
                            : u.getName();
                    return new CourierDTO(u.getId(), clientName);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignCourier(Long orderId, Long courierId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Заказ не найден"));

        User courier = null;
        if (courierId != null) {
            courier = userRepository.findById(courierId)
                    .orElseThrow(() -> new EntityNotFoundException("Курьер не найден"));
            boolean isCourier = courier.getRoles().stream()
                    .anyMatch(role -> "ROLE_COURIER".equals(role.getName()));
            if (!isCourier) {
                throw new IllegalArgumentException("Пользователь не является курьером");
            }
        }

        order.setCourier(courier);
        orderRepository.save(order);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (!isValidStatus(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    private boolean isValidStatus(String status) {
        return List.of("ACCEPTED", "PROCESSING", "ON_THE_WAY", "DELIVERED").contains(status);
    }

    public List<OrderAdminDTO> getOrdersByCourierId(Long courierId) {
        List<Order> orders = orderRepository.findByCourierId(courierId);
        return orders.stream().map(order -> {
            ClientDTO clientDTO = null;
            if (order.getClient() != null) {
                clientDTO = ClientDTO.from(order.getClient());
            }
            Long courierIdValue = order.getCourier() != null ? order.getCourier().getId() : null;
            String courierName = order.getCourier() != null ? order.getCourier().getName() : null;

            return new OrderAdminDTO(
                    order.getId(),
                    order.getStatus(),
                    order.getCreatedAt(),
                    clientDTO,
                    courierIdValue,
                    courierName,
                    order.getTotalAmount(),
                    order.getComment()
            );
        }).collect(Collectors.toList());
    }

    public List<OrderAdminDTO> getOrdersByCourierIdAndStatus(Long courierId, String status) {
        List<Order> orders = orderRepository.findByCourierIdAndStatus(courierId, status);
        return orders.stream().map(order -> {
            ClientDTO clientDTO = null;
            if (order.getClient() != null) {
                clientDTO = ClientDTO.from(order.getClient());
            }
            Long courierIdValue = order.getCourier() != null ? order.getCourier().getId() : null;
            String courierName = order.getCourier() != null ? order.getCourier().getName() : null;

            return new OrderAdminDTO(
                    order.getId(),
                    order.getStatus(),
                    order.getCreatedAt(),
                    clientDTO,
                    courierIdValue,
                    courierName,
                    order.getTotalAmount(),
                    order.getComment()
            );
        }).collect(Collectors.toList());
    }

}
