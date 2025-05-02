package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.topa.timedelivery.entities.catalog.TypeDishes;

@Repository
public interface TypeDishesRepository extends JpaRepository<TypeDishes, Long> {
    boolean existsByName(String name);
    TypeDishes findByName(String name);
}

