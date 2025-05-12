package ru.topa.timedelivery.controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import ru.topa.timedelivery.DTOs.AuthRequest;
import ru.topa.timedelivery.DTOs.AuthResponse;
import ru.topa.timedelivery.DTOs.ClientDTO;
import ru.topa.timedelivery.DTOs.UserDTO;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.models.ClientService;
import ru.topa.timedelivery.security.JwtService;
import ru.topa.timedelivery.services.UserDetailService;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/timeDelivery")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailService userDetailService;
    private final JwtService jwtService;
    private final ClientService clientService;


    public AuthController(AuthenticationManager authenticationManager, UserDetailService userDetailService, JwtService jwtService, ClientService clientService) {
        this.authenticationManager = authenticationManager;
        this.userDetailService = userDetailService;
        this.jwtService = jwtService;
        this.clientService = clientService;
    }

    @GetMapping("/user/me")
    public ResponseEntity<UserDTO> getUserInfo(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        UserDTO userDTO = new UserDTO();
        userDTO.setPhone(user.getName());
        return ResponseEntity.ok(userDTO);
    }

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest,
                                   HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getPhone(), authRequest.getPassword())
            );

            User user = (User) authentication.getPrincipal();
            String jwt = jwtService.generateToken(user);

            Cookie cookie = new Cookie("jwt", jwt);
            cookie.setHttpOnly(true);
            cookie.setSecure(true); // включите, если используете HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60);
            response.addCookie(cookie);

            // Получаем роли пользователя в виде Set<String>
            Set<String> roles = user.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());

            // Возвращаем токен, имя и роли
            return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername(), roles));

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        boolean isSecure = request.isSecure();

        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(isSecure);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
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

    @PostMapping("/register/courier")
    public ResponseEntity<String> registerCourier(@RequestBody AuthRequest authRequest){
        userDetailService.registerCourier(
                authRequest.getName(),
                authRequest.getEmail(),
                authRequest.getPhone(),
                authRequest.getPassword());
        return ResponseEntity.ok("Courier registered is ok");
    }
}
