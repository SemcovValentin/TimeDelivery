package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.topa.timedelivery.entities.catalog.DeletedDishes;

public interface DeletedDishesRepository extends JpaRepository<DeletedDishes, Long> {
}

