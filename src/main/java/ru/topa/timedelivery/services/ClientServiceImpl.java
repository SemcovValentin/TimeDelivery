package ru.topa.timedelivery.services;

import org.springframework.stereotype.Service;
import ru.topa.timedelivery.DTOs.ClientDTO;
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
    public void update(User user, ClientDTO updateRequest) {
        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Клиент не найден"));

        if (updateRequest.getEmail() != null) {
            client.setEmail(updateRequest.getEmail());
        }
        if (updateRequest.getAddress() != null) {
            client.setAddress(updateRequest.getAddress());
        }
        if (updateRequest.getCity() != null) {
            client.setCity(updateRequest.getCity());
        }
        if (updateRequest.getBirthday() != null) {
            client.setBirthday(updateRequest.getBirthday());
        }

        clientRepository.save(client);
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

