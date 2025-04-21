package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.topa.timedelivery.entities.catalog.Dishes;

@Repository
public interface DishesRepository extends JpaRepository<Dishes, Long> {
}
