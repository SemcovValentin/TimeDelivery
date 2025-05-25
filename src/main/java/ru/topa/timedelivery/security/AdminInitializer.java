package ru.topa.timedelivery.security;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import ru.topa.timedelivery.services.UserDetailService;
import ru.topa.timedelivery.services.UserService;

@Component
public class AdminInitializer implements ApplicationRunner {

    private final UserDetailService userDetailService;

    @Value("${admin.phone}")
    private String adminPhone;

    @Value("${admin.name}")
    private String adminName;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    public AdminInitializer(UserDetailService userDetailService, UserService userService) {
        this.userDetailService = userDetailService;
    }

    @Override
    public void run(ApplicationArguments args) {
        userDetailService.registerAdmin(adminName, adminEmail, adminPhone, adminPassword);
        System.out.println("Администратор создан: " + adminPhone + " / " + adminPassword);

    }
}
