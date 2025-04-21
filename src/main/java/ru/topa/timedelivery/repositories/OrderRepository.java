package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.topa.timedelivery.entities.orders.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
