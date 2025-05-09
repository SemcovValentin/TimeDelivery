package ru.topa.timedelivery.services;

import org.springframework.stereotype.Service;
import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.models.ClientService;
import ru.topa.timedelivery.repositories.ClientRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    public ClientServiceImpl(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @Override
    public Client create(Client client) {
        return clientRepository.save(client);
    }

    @Override
    public List<Client> readAll() {
        return clientRepository.findAll();
    }

    @Override
    public Client read(Long id) {
        return clientRepository.findById(id).orElse(null);
    }

    @Override
    public boolean update(Client client, Long id) {
        if (!clientRepository.existsById(id)) {
            return false;
        }
        client.setId(id);
        clientRepository.save(client);
        return true;
    }

    @Override
    public boolean delete(Long id) {
        if (!clientRepository.existsById(id)) {
            return false;
        }
        clientRepository.deleteById(id);
        return true;
    }

    @Override
    public Optional<Client> findByUser(User user) {
        return clientRepository.findByUser(user);
    }
}

