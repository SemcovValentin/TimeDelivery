package ru.topa.timedelivery.controllers;

import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.topa.timedelivery.security.JwtService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/timeDelivery/token")
public class TokenController {

    private final JwtService jwtService;

    public TokenController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @GetMapping("/claims")
    public Map<String, Object> getTokenClaims(@RequestParam String token) {
        Claims claims = jwtService.extractAllClaims(token);
        return new HashMap<>(claims);
    }
}
