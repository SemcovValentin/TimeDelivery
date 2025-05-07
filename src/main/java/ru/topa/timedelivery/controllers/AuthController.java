package ru.topa.timedelivery.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.DTOs.AuthRequest;
import ru.topa.timedelivery.DTOs.AuthResponse;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.security.JwtService;
import ru.topa.timedelivery.services.UserDetailService;

@RestController
@RequestMapping("/timeDelivery")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailService userDetailService;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, UserDetailService userDetailService, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userDetailService = userDetailService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getPhone(), authRequest.getPassword())
            );
            User user = (User) authentication.getPrincipal();
            String jwt = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(jwt));
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest authRequest) {
        userDetailService.registerDefaultUser(
                authRequest.getName(),
                authRequest.getEmail(),
                authRequest.getPhone(),
                authRequest.getPassword()
        );
        return ResponseEntity.ok("User registered is ok");
    }


    @PostMapping("/register/admin")
    public ResponseEntity<String> registerAdmin(@RequestBody AuthRequest authRequest){
        userDetailService.registerAdmin(
                authRequest.getName(),
                authRequest.getEmail(),
                authRequest.getPhone(),
                authRequest.getPassword());
        return ResponseEntity.ok("Admin registered is ok");
    }

    @PostMapping("/register/moderator")
    public ResponseEntity<String> registerModerator(@RequestBody AuthRequest authRequest){
        userDetailService.registerModerator(
                authRequest.getName(),
                authRequest.getEmail(),
                authRequest.getPhone(),
                authRequest.getPassword());
        return ResponseEntity.ok("Moderator registered is ok");
    }
}
