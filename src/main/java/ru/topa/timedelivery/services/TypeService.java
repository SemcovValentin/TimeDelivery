package ru.topa.timedelivery.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.entities.catalog.Type;
import ru.topa.timedelivery.repositories.DishesRepository;
import ru.topa.timedelivery.repositories.TypeRepository;

import java.util.List;

@Service
public class TypeService {

    @Autowired
    private TypeRepository repository;

    @Autowired
    private DishesRepository dishesRepository;


    public void addAllTypes() {
        List<Type> dishes = List.of(addType("Вегетарианское"),addType("Острое"),addType("Новинки"),addType("Хит"));
        repository.saveAll(dishes);
    }

    public List<Type> getAllTypes() {
        return repository.findAll();
    }

    public Type addType(String name) {
        if (repository.existsByName(name)) {
            throw new IllegalArgumentException("Тип с таким именем уже существует!");
        }
        Type type = new Type();
        type.setName(name);
        return repository.save(type);
    }

    public void deleteType(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Тип с таким ID не найден!");
        }
        boolean isUsed = dishesRepository.existsByTypes_Id(id);
        if (isUsed) {
            throw new IllegalStateException("Тип используется в блюдах и не может быть удалён!");
        }
        repository.deleteById(id);
    }
}
