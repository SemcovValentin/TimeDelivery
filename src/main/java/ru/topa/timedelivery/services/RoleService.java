package ru.topa.timedelivery.services;

import jakarta.persistence.EntityNotFoundException;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.DTOs.RoleDTO;
import ru.topa.timedelivery.entities.persons.Role;
import ru.topa.timedelivery.repositories.RoleRepository;
import ru.topa.timedelivery.repositories.UserRepository;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public RoleService(RoleRepository roleRepository, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    public void addRole(RoleDTO roleDTO) throws BadRequestException {
        String roleName = roleDTO.getName();

        if (!roleName.startsWith("ROLE_")) {
            throw new BadRequestException("Имя роли должно начинаться с 'ROLE_'");
        }

        if (roleRepository.findByName(roleName).isPresent()) {
            throw new DataConflictException("Роль с таким именем уже существует");
        }

        Role role = new Role(roleName);
        roleRepository.save(role);
    }

    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Роль не найдена"));

        // Запрет на удаление системных ролей
        if ("ROLE_USER".equals(role.getName()) || "ROLE_ADMIN".equals(role.getName())) {
            throw new ForbiddenOperationException("Удаление системных ролей запрещено");
        }

        // Проверяем, используется ли роль у пользователей
        boolean isRoleUsed = userRepository.existsByRoles(role);
        if (isRoleUsed) {
            throw new DataConflictException("Роль используется у пользователей и не может быть удалена");
        }

        roleRepository.delete(role);
    }

    public class ForbiddenOperationException extends RuntimeException {
        public ForbiddenOperationException(String message) {
            super(message);
        }
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

}

