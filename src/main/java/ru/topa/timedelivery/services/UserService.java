package ru.topa.timedelivery.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.DTOs.ClientDTO;
import ru.topa.timedelivery.DTOs.EmployeeDTO;
import ru.topa.timedelivery.DTOs.UserDTO;
import ru.topa.timedelivery.entities.orders.Order;
import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.Role;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.ClientRepository;
import ru.topa.timedelivery.repositories.OrderRepository;
import ru.topa.timedelivery.repositories.RoleRepository;
import ru.topa.timedelivery.repositories.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderRepository orderRepository;

    public UserService(UserRepository userRepository, ClientRepository clientRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public void deleteEmployee(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));

        boolean isEmployee = user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(role -> !role.equals("ROLE_ADMIN") && !role.equals("ROLE_USER"));

        if (!isEmployee) {
            throw new ForbiddenOperationException("Удаление данного пользователя запрещено");
        }

        // Очистить связь с Client
        Optional<Client> clientOpt = clientRepository.findByUser(user);

        if (clientOpt.isPresent()) {
            Client client = clientOpt.get();
            client.setUser(null);
            clientRepository.delete(client);
        }

        // Очистить ссылки courier у заказов, если нужно
        List<Order> orders = orderRepository.findAllByCourier(user);
        for (Order order : orders) {
            order.setCourier(null);
        }
        orderRepository.saveAll(orders);

        userRepository.delete(user);
    }




    @Value("${default.user.password}")
    private String defaultUserPassword;

    public void addEmployee(EmployeeDTO dto) {
        if (userRepository.findByName(dto.getPhone()).isPresent()) {
            throw new DataConflictException("Пользователь с таким телефоном уже существует");
        }

        if (clientRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DataConflictException("Пользователь с такой почтой уже существует");
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
    }

    public boolean updateUserWithPasswordCheck(User user, UserDTO req) {
        // Проверяем текущий пароль
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            return false;
        }
        // Меняем телефон
        if (req.getPhone() != null) {
            user.setName(req.getPhone());
        }
        // Меняем пароль, если новый задан
        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }
        userRepository.save(user);
        return true;
    }

    public void updateEmployee(Long id, EmployeeDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));

        Client client = user.getClient();

        // Проверка уникальности телефона
        if (!user.getName().equals(dto.getPhone()) && userRepository.findByName(dto.getPhone()).isPresent()) {
            throw new DataConflictException("Пользователь с таким телефоном уже существует");
        }

        // Проверка уникальности email
        if (client != null && !dto.getEmail().equalsIgnoreCase(client.getEmail())) {
            Optional<Client> clientWithEmail = clientRepository.findByEmail(dto.getEmail());
            if (clientWithEmail.isPresent() && !clientWithEmail.get().getId().equals(client.getId())) {
                throw new DataConflictException("Пользователь с такой почтой уже существует");
            }
        }

        // Обновляем пользователя
        user.setName(dto.getPhone());

        // Обновляем роли
        Set<Role> roles = dto.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Роль не найдена: " + roleName)))
                .collect(Collectors.toSet());
        user.setRoles(roles);

        // Обновляем или создаём клиента
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
    }

    public class DataConflictException extends RuntimeException {
        public DataConflictException(String message) {
            super(message);
        }
    }

    public class EntityNotFoundException extends RuntimeException {
        public EntityNotFoundException(String message) {
            super(message);
        }
    }

    public class ForbiddenOperationException extends RuntimeException {
        public ForbiddenOperationException(String message) {
            super(message);
        }
    }

    public Page<ClientDTO> getClients(int page, int size, String sortBy, String direction) {
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

        return usersPage.map(user -> {
            Client client = user.getClient();
            ClientDTO dto = client != null ? ClientDTO.from(client) : new ClientDTO();
            dto.setPhone(user.getName());
            dto.setId(user.getId());
            return dto;
        });
    }

}
