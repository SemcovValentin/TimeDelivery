package ru.topa.timedelivery.services;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.DTOs.UserDTO;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.UserRepository;
import ru.topa.timedelivery.utils.RestUtils;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    RestUtils restUtils;

    public void checkValidationCreateUser(@Valid UserDTO userDTO){
        restUtils.createUser(userDTO);
    }
}
