package ru.topa.timedelivery.controllers;


import jakarta.persistence.EntityNotFoundException;
import org.apache.coyote.BadRequestException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;
import ru.topa.timedelivery.DTOs.ClientDTO;
import ru.topa.timedelivery.DTOs.DishesDTO;
import ru.topa.timedelivery.DTOs.EmployeeDTO;
import ru.topa.timedelivery.DTOs.RoleDTO;
import ru.topa.timedelivery.entities.catalog.DeletedDishes;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.entities.persons.Role;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.*;
import ru.topa.timedelivery.services.*;

import java.util.*;
import java.util.stream.Collectors;


@Controller
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    DishesService dishesService;
    @Autowired
    TypeDishesService service;
    @Autowired
    UserRepository userRepository;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    private TypeService typeService;
    @Autowired
    private UserService userService;
    @Autowired
    private RoleService roleService;
    @Autowired
    private DeletedDishesRepository deletedDishesRepository;


    @GetMapping("/")
    public String home() {
        return "admin";
    }


    @GetMapping("/addAll")
    @ResponseBody
    public String addAll() {
        typeService.addAllTypes();
        service.addAllCategories();
        dishesService.addAllDishes();
        return "all dishas is added";
    }


    @GetMapping
    public List<TypeDishes> getAll() {
        return service.getAllCategories();
    }

    @PostMapping
    public TypeDishes add(@RequestBody Map<String, String> body) {
        return service.addCategory(body.get("name"));
    }

    @PostMapping(value = "/create/dishes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DishesDTO> createDish(
            @RequestParam("name") String name,
            @RequestParam("price") double price,
            @RequestParam("weight") int weight,
            @RequestParam("ingredient") String ingredient,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("typeId") Long typeId,
            @RequestPart("image") MultipartFile imageFile
    ) {
        try {
            DishesDTO createdDish = dishesService.createDish(name, price, weight, ingredient, categoryId, typeId, imageFile);
            return ResponseEntity.ok(createdDish);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/dishes/{id}")
    public ResponseEntity<?> updateDish(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam double price,
            @RequestParam int weight,
            @RequestParam String ingredient,
            @RequestParam Long categoryId,
            @RequestParam Long typeId,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        try {
            DishesDTO updatedDish = dishesService.updateDish(id, name, price, weight, ingredient, categoryId, typeId, imageFile);
            return ResponseEntity.ok(updatedDish);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Ошибка сервера при обновлении блюда"));
        }
    }

    @GetMapping("/dishes/{dishId}")
    public ResponseEntity<DishesDTO> getDishById(@PathVariable Long dishId) {
        DishesDTO dish = dishesService.findById(dishId);
        if (dish == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dish);
    }


    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        return userRepository.findById(id)
                .filter(user -> user.getRoles().stream()
                        .map(Role::getName)
                        .anyMatch(role -> !role.equals("ROLE_USER") && !role.equals("ROLE_ADMIN")))
                .map(user -> {
                    EmployeeDTO dto = EmployeeDTO.from(user);
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/employees")
    @ResponseBody
    public List<EmployeeDTO> getEmployees() {
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(user -> user.getRoles().stream()
                        .map(Role::getName)
                        .anyMatch(roleName -> !roleName.equals("ROLE_USER")))
                .map(EmployeeDTO::from)
                .toList();
    }

    @DeleteMapping("/employees/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        try {
            userService.deleteEmployee(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UserService.ForbiddenOperationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PostMapping("/employees")
    public ResponseEntity<?> addEmployee(@RequestBody EmployeeDTO dto) {
        try {
            userService.addEmployee(dto);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (UserService.DataConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Внутренняя ошибка сервера"));
        }
    }

    @GetMapping("/roles")
    @ResponseBody
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(role -> new RoleDTO(role.getId(), role.getName()))
                .toList();
    }

    @PostMapping("/roles")
    public ResponseEntity<?> addRole(@RequestBody RoleDTO roleDTO) {
        try {
            roleService.addRole(roleDTO);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (RoleService.DataConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Внутренняя ошибка сервера"));
        }
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        try {
            roleService.deleteRole(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (RoleService.ForbiddenOperationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (UserService.DataConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Внутренняя ошибка сервера"));
        }
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody EmployeeDTO dto) {
        try {
            userService.updateEmployee(id, dto);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UserService.DataConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Внутренняя ошибка сервера"));
        }
    }


    @GetMapping("/clients")
    public ResponseEntity<Page<ClientDTO>> getClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Page<ClientDTO> clientsPage = userService.getClients(page, size, sortBy, direction);
        return ResponseEntity.ok(clientsPage);
    }

    @GetMapping("/dishes")
    @ResponseBody
    public Page<DishesDTO> getAllDishes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long typeId) {

        return dishesService.getAllDishes(page, size, categoryId, typeId);
    }

    @DeleteMapping("/dishes/{id}")
    public ResponseEntity<?> deleteDish(@PathVariable Long id) {
        try {
            dishesService.deleteDish(id);
            return ResponseEntity.ok(Map.of("message", "Блюдо успешно удалено"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Ошибка при удалении блюда"));
        }
    }

    @PostMapping("/restore/{id}")
    public ResponseEntity<?> restoreDish(@PathVariable Long id) {
        try {
            DishesDTO restoredDish = dishesService.restoreDish(id);
            return ResponseEntity.ok(restoredDish);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Ошибка при восстановлении блюда"));
        }
    }

    @GetMapping("/deleted/dishes/load")
    public ResponseEntity<List<DishesDTO>> getAllDeletedDishes() {
        List<DeletedDishes> deletedDishes = deletedDishesRepository.findAll();

        List<DishesDTO> dtos = deletedDishes.stream()
                .map(dishesService::toDTOFromDeleted)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/deleted/dishes/{id}")
    public ResponseEntity<?> deleteDeletedDish(@PathVariable Long id) {
        try {
            dishesService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Блюдо удалено навсегда"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Ошибка при удалении блюда"));
        }
    }






}
