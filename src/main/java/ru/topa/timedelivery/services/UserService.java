package ru.topa.timedelivery.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.DTOs.UserDTO;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.UserRepository;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void update(User user, UserDTO updateRequest) {
        user.setName(updateRequest.getName());

        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isBlank()) {
            String encodedPassword = passwordEncoder.encode(updateRequest.getPassword());
            user.setPassword(encodedPassword);
        }

        userRepository.save(user);
    }
}
