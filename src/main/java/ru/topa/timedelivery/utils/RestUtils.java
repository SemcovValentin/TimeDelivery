package ru.topa.timedelivery.utils;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import ru.topa.timedelivery.DTOs.UserDTO;
import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.ClientRepository;
import ru.topa.timedelivery.repositories.UserRepository;

@Component
public class RestUtils {

    @Autowired
    UserRepository userRepository;

    @Autowired
    ClientRepository clientRepository;

    public void createUser(@Valid UserDTO userDTO) {

        User user = new User();
        user.setPassword(userDTO.getPassword());
        user.setName(userDTO.getName());
        userRepository.save(user);

        Client client = new Client();
        client.setPhone(userDTO.getName());
        client.setUser(user);
        clientRepository.save(client);
    }
}
