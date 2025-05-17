package ru.topa.timedelivery.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import ru.topa.timedelivery.entities.persons.Role;
import ru.topa.timedelivery.entities.persons.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByName(String name);
    boolean existsByRoles(Role role);
    /*List<User> findAllByRoles_Name(String roleName);*/
    Page<User> findAllByRoles_Name(String roleName, Pageable pageable);




}
