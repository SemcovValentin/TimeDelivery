package ru.topa.timedelivery.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.repositories.DishesRepository;
import ru.topa.timedelivery.repositories.TypeDishesRepository;

import java.util.List;


@Service
public class TypeDishesService {

    @Autowired
    public TypeDishesRepository repository;
    @Autowired
    DishesRepository dishesRepository;

    public List<TypeDishes> getAllCategories() {
        return repository.findAll();
    }

    public TypeDishes addCategory(String name) {
        if (repository.existsByName(name)) {
            throw new IllegalArgumentException("Категория с таким именем уже существует!");
        }
        TypeDishes typeDishes = new TypeDishes();
        typeDishes.setName(name);
        return repository.save(typeDishes);
    }

    public void addAllCategories() {
        List<TypeDishes> dishes = List.of(addCategory("Пицца"),addCategory("Салаты"),addCategory("Wok"),addCategory("Роллы"),addCategory("Бургеры"));
        repository.saveAll(dishes);
    }

    public void deleteCategory(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Категория с таким ID не найдена!");
        }
        boolean isUsed = dishesRepository.existsByTypeDishes_Id(id);
        if (isUsed) {
            throw new IllegalStateException("Категория используется в блюдах и не может быть удалена!");
        }
        repository.deleteById(id);
    }

}
