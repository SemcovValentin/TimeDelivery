package ru.topa.timedelivery.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import ru.topa.timedelivery.DTOs.UserDTO;
import ru.topa.timedelivery.services.UserService;

@RestController
@RequestMapping("/timeDelivery/user")
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("/test")
    public String test() {
        return "test";
    }

    @PostMapping("/create")
    public ResponseEntity<Object> createUser(@RequestBody UserDTO userDTO) {
       userService.checkValidationCreateUser(userDTO);
       return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
    }


}
