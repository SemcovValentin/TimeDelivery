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
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.entities.persons.Role;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.*;
import ru.topa.timedelivery.services.*;

import java.math.BigDecimal;
import java.util.*;


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
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("weight") Integer weight,
            @RequestParam("ingredient") String ingredient,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("typeId") Long typeId,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        try {
            DishesDTO updatedDish = dishesService.updateDish(id, name, price, weight, ingredient, categoryId, typeId, imageFile);
            return ResponseEntity.ok(updatedDish);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Ошибка сервера при обновлении блюда"));
        }
    }


    /*@PostMapping(value = "/create/dishes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Dishes> createDish(
            @RequestParam("name") String name,
            @RequestParam("price") double price,
            @RequestParam("weight") int weight,
            @RequestParam("ingredient") String ingredient,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("typeId") Long typeId,
            @RequestPart("image") MultipartFile imageFile
    ) {
        // 1. Сохраняем изображение на диск и получаем URL
        String imageUrl = fileStorageService.saveImage(imageFile);

        // 2. Загружаем категории и типы
        Set<TypeDishes> categories = new HashSet<>();
        categories.add(typeDishesRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Категория не найдена")));

        Set<Type> types = new HashSet<>();
        types.add(typeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Тип не найден")));

        // 3. Создаём блюдо
        Dishes dish = new Dishes(name, price, weight, imageUrl, ingredient, categories, types);
        Dishes saved = dishesRepository.save(dish);

        return ResponseEntity.ok(saved);
    }*/

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


    /*@DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        boolean isEmployee = user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(role -> !role.equals("ROLE_ADMIN") && !role.equals("ROLE_USER"));

        if (!isEmployee) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }*/

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


    /*@PostMapping("/employees")
    public ResponseEntity<?> addEmployee(@RequestBody EmployeeDTO dto) {

        if (userRepository.findByName(dto.getPhone()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Пользователь с таким телефоном уже существует"));
        }
        if (clientRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Пользователь с такой почтой уже существует"));
        }

        User user = new User();
        user.setName(dto.getPhone());
        user.setPassword(passwordEncoder.encode(defaultUserPassword));

        Set<Role> roles = dto.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Роль не найдена: " + roleName)))
                .collect(Collectors.toSet());
        user.setRoles(roles);

        Client client = new Client();
        client.setName(dto.getName());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());
        client.setUser(user);

        user.setClient(client);

        clientRepository.save(client);
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }*/

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


    /*@PostMapping("/roles")
    public ResponseEntity<?> addRole(@RequestBody RoleDTO roleDTO) {
        String roleName = roleDTO.getName();

        if (!roleName.startsWith("ROLE_")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Имя роли должно начинаться с 'ROLE_'"));
        }

        if (roleRepository.findByName(roleName).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Роль с таким именем уже существует"));
        }

        Role role = new Role(roleName);
        roleRepository.save(role);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }*/

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


    /*@DeleteMapping("/roles/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        Optional<Role> roleOpt = roleRepository.findById(id);
        if (roleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Role role = roleOpt.get();

        // Запрет на удаление системных ролей
        if ("ROLE_USER".equals(role.getName()) || "ROLE_ADMIN".equals(role.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Удаление системных ролей запрещено"));
        }

        // Проверяем, используется ли роль у пользователей
        boolean isRoleUsed = userRepository.existsByRoles(role);
        if (isRoleUsed) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Роль используется у пользователей и не может быть удалена"));
        }

        roleRepository.delete(role);
        return ResponseEntity.noContent().build();
    }*/

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


    /*@PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody EmployeeDTO dto) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        Client client = user.getClient();

        if (!user.getName().equals(dto.getPhone()) && userRepository.findByName(dto.getPhone()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Пользователь с таким телефоном уже существует"));
        }
        if (client != null && !dto.getEmail().equalsIgnoreCase(client.getEmail())) {
            Optional<Client> clientWithEmail = clientRepository.findByEmail(dto.getEmail());
            if (clientWithEmail.isPresent() && !clientWithEmail.get().getId().equals(client.getId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Пользователь с такой почтой уже существует"));
            }
        }

        user.setName(dto.getPhone());

        // Обновляем роли
        Set<Role> roles = dto.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Роль не найдена: " + roleName)))
                .collect(Collectors.toSet());
        user.setRoles(roles);

        // Обновляем данные клиента
        if (client == null) {
            client = new Client();
            client.setUser(user);
            user.setClient(client);
        }
        client.setName(dto.getName());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());

        clientRepository.save(client);
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }*/

    @GetMapping("/clients")
    public ResponseEntity<Page<ClientDTO>> getClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Page<ClientDTO> clientsPage = userService.getClients(page, size, sortBy, direction);
        return ResponseEntity.ok(clientsPage);
    }

    /*@GetMapping("/clients")
    public ResponseEntity<Page<ClientDTO>> getClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size);

        Specification<User> spec = (root, query, cb) -> {
            Join<User, Role> roles = root.join("roles");
            Join<User, Client> clientJoin = root.join("client", JoinType.LEFT);

            Predicate rolePredicate = cb.equal(roles.get("name"), "ROLE_USER");

            Set<String> clientFields = Set.of("address", "email", "name", "city", "birthday");
            Set<String> userFields = Set.of("id", "name");

            String sortProperty = sortBy;
            if (!clientFields.contains(sortBy) && !userFields.contains(sortBy)) {
                sortProperty = "id";
            }

            if (clientFields.contains(sortProperty)) {
                if (sortDirection == Sort.Direction.ASC) {
                    query.orderBy(cb.asc(clientJoin.get(sortProperty)));
                } else {
                    query.orderBy(cb.desc(clientJoin.get(sortProperty)));
                }
            } else {
                if (sortDirection == Sort.Direction.ASC) {
                    query.orderBy(cb.asc(root.get(sortProperty)));
                } else {
                    query.orderBy(cb.desc(root.get(sortProperty)));
                }
            }

            return rolePredicate;
        };


        Page<User> usersPage = userRepository.findAll(spec, pageable);

        Page<ClientDTO> dtoPage = usersPage.map(user -> {
            Client client = user.getClient();
            ClientDTO dto = client != null ? ClientDTO.from(client) : new ClientDTO();
            dto.setPhone(user.getName());
            dto.setId(user.getId());
            return dto;
        });

        return ResponseEntity.ok(dtoPage);
    }*/

    @GetMapping("/dishes")
    @ResponseBody
    public Page<DishesDTO> getAllDishes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long typeId) {

        return dishesService.getAllDishes(page, size, categoryId, typeId);
    }

    /*@GetMapping("/dishes")
    @ResponseBody
    public Page<DishesDTO> getAllDishes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long typeId) {

        Page<Dishes> dishesPage;

        if (categoryId != null && typeId != null) {
            dishesPage = dishesRepository.findByTypeDishes_IdAndTypes_Id(categoryId, typeId, PageRequest.of(page, size));
        } else if (categoryId != null) {
            dishesPage = dishesRepository.findByTypeDishes_Id(categoryId, PageRequest.of(page, size));
        } else if (typeId != null) {
            dishesPage = dishesRepository.findByTypes_Id(typeId, PageRequest.of(page, size));
        } else {
            dishesPage = dishesRepository.findAll(PageRequest.of(page, size));
        }

        return dishesPage.map(this::toDTO);
    }


    private DishesDTO toDTO(Dishes dish) {
        DishesDTO dto = new DishesDTO(
                dish.getName(),
                dish.getPrice(),
                dish.getWeight(),
                dish.getImageUrl(),
                dish.getIngredient(),
                dish.getTypeDishes(),
                dish.getTypes()
        );
        dto.setId(dish.getId());
        return dto;
    }*/




}
