package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.topa.timedelivery.entities.orders.Order;
import ru.topa.timedelivery.entities.persons.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByIdAndUserName(Long id, String name);
    List<Order> findAllByUserName(String name);
    List<Order> findAllByCourier(User courier);

}
