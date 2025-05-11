package ru.topa.timedelivery.models;

import ru.topa.timedelivery.DTOs.ClientDTO;
import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.User;

import java.util.List;
import java.util.Optional;

public interface ClientService {
    Client create(Client client);
    List<Client> readAll();
    Client read(Long id);
    void update(User user, ClientDTO updateRequest);
    boolean delete(Long id);

    Optional<Client> findByUser(User user);
}
