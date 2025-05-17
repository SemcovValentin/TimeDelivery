package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.User;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByUser(User user);
    Optional<Client> findByEmail(String email);

}
