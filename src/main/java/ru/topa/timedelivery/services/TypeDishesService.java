package ru.topa.timedelivery.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.repositories.TypeDishesRepository;

import java.util.List;


@Service
public class TypeDishesService {

    @Autowired
    private TypeDishesRepository repository;

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
}
