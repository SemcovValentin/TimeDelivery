package ru.topa.timedelivery.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.services.TypeDishesService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/categories")
public class TypeDishesController {

    private final TypeDishesService typeDishesService;

    public TypeDishesController(TypeDishesService typeDishesService) {
        this.typeDishesService = typeDishesService;
    }

    @GetMapping
    public List<TypeDishes> getAllCategories() {
        return typeDishesService.getAllCategories();
    }

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Название категории не может быть пустым"));
        }
        try {
            TypeDishes newCategory = typeDishesService.addCategory(name.trim());
            return ResponseEntity.ok(newCategory);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            typeDishesService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
        }
    }

}

