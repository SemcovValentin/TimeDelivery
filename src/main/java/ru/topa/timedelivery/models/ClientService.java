package ru.topa.timedelivery.models;

import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.User;

import java.util.List;
import java.util.Optional;

public interface ClientService {
    Client create(Client client);
    List<Client> readAll();
    Client read(Long id);
    boolean update(Client client, Long id);
    boolean delete(Long id);

    Optional<Client> findByUser(User user);
}
