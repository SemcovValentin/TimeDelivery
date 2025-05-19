package ru.topa.timedelivery.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.topa.timedelivery.entities.catalog.Dishes;

@Repository
public interface DishesRepository extends JpaRepository<Dishes, Long> {
    Page<Dishes> findByTypeDishes_Id(Long categoryId, Pageable pageable);
    boolean existsByTypeDishes_Id(Long categoryId);
    boolean existsByTypes_Id(Long typeId);


}
