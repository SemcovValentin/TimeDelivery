package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.DTOs.ClientDTO;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.models.ClientService;



@RestController
@RequestMapping("/timeDelivery/user")
public class UserController {

    @Autowired
    ClientService clientService;

    @GetMapping("/me")
    public ResponseEntity<ClientDTO> getCurrentClient(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = (User) authentication.getPrincipal();

        return clientService.findByUser(user)
                .map(client -> ResponseEntity.ok(ClientDTO.from(client)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }



}
