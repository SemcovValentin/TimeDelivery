package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.topa.timedelivery.entities.orders.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {}