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

    public boolean updateUserWithPasswordCheck(User user, UserDTO req) {
        // Проверяем текущий пароль
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            return false;
        }
        // Меняем телефон
        if (req.getPhone() != null) {
            user.setName(req.getPhone());
        }
        // Меняем пароль, если новый задан
        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }
        userRepository.save(user);
        return true;
    }

}
