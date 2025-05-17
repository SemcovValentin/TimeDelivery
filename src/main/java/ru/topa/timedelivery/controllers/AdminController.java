package ru.topa.timedelivery.controllers;


import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.DTOs.ClientDTO;
import ru.topa.timedelivery.DTOs.EmployeeDTO;
import ru.topa.timedelivery.DTOs.RoleDTO;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.Role;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.ClientRepository;
import ru.topa.timedelivery.repositories.RoleRepository;
import ru.topa.timedelivery.repositories.UserRepository;
import ru.topa.timedelivery.services.DishesService;
import ru.topa.timedelivery.services.TypeDishesService;

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
    PasswordEncoder passwordEncoder;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    private ClientRepository clientRepository;

    @Value("${default.user.password}")
    private String defaultUserPassword;


    @GetMapping("/")
    public String home() {
        return "admin";
    }


    @GetMapping("/addAll")
    @ResponseBody
    public String addAll() {
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

    @PostMapping("/create/dishes")
    public Dishes createDish(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        double price = (Double) request.get("price");
        int weight = (Integer) request.get("weight");
        String imageUrl = (String) request.get("imageUrl");
        String ingredient = (String) request.get("ingredient");
        boolean isVegan = (Boolean) request.get("isVegan");
        boolean isSpicy = (Boolean) request.get("isSpicy");
        boolean isTop = (Boolean) request.get("isTop");
        boolean isNew = (Boolean) request.get("isNew");
        List<String> categoryNames = (List<String>) request.get("categoryNames");

        return dishesService.createDish(name, price, weight, imageUrl, ingredient, isVegan, isSpicy, isTop, isNew, categoryNames);
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
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        boolean isEmployee = user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(role -> !role.equals("ROLE_ADMIN") && !role.equals("ROLE_USER"));

        if (!isEmployee) {
            // Запрет на удаление, если роль admin или user
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/employees")
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
    }


    @DeleteMapping("/roles/{id}")
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
    }

    @PutMapping("/employees/{id}")
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
    }

    /*@GetMapping("/clients")
    public ResponseEntity<Page<ClientDTO>> getClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<User> usersPage = userRepository.findAllByRoles_Name("ROLE_USER", pageable);

        Page<ClientDTO> dtoPage = usersPage.map(user -> {
            Client client = user.getClient();
            if (client == null) {
                ClientDTO dto = new ClientDTO();
                dto.setPhone(user.getName());
                dto.setUserId(user.getId());
                return dto;
            }
            ClientDTO dto = ClientDTO.from(client);
            dto.setPhone(user.getName());
            dto.setUserId(user.getId());
            return dto;
        });
        return ResponseEntity.ok(dtoPage);
    }
*/

    @GetMapping("/clients")
    public ResponseEntity<Page<ClientDTO>> getClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size); // сортировку задаём в Specification

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
    }


}
