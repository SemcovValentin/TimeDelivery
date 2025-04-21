package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.topa.timedelivery.entities.persons.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
