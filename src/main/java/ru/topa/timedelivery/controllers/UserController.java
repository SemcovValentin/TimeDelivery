package ru.topa.timedelivery.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.DTOs.ClientDTO;
import ru.topa.timedelivery.DTOs.UserDTO;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.services.ClientServiceImpl;
import ru.topa.timedelivery.services.UserService;


@Controller
@RequestMapping("/user")
public class UserController {

    private final ClientServiceImpl clientServiceImpl;
    private final UserService userService;

    public UserController(ClientServiceImpl clientServiceImpl, UserService userService) {
        this.clientServiceImpl = clientServiceImpl;
        this.userService = userService;
    }

    @GetMapping("/")
    public String home() {
        return "user";
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserDTO req, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();

        boolean ok = userService.updateUserWithPasswordCheck(user, req);
        if (ok) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Текущий пароль неверный");
        }
    }


    @PutMapping("/updateClient")
    public ResponseEntity<?> updateClient(@RequestBody @Valid ClientDTO updateRequest,
                                          Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = (User) authentication.getPrincipal();

        try {
            clientServiceImpl.update(user, updateRequest);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
