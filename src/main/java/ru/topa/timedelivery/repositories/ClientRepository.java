package ru.topa.timedelivery.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.topa.timedelivery.entities.persons.Client;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
}
