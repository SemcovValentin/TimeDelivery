package ru.topa.timedelivery.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.entities.persons.Client;
import ru.topa.timedelivery.entities.persons.Role;
import ru.topa.timedelivery.entities.persons.User;
import ru.topa.timedelivery.repositories.ClientRepository;
import ru.topa.timedelivery.repositories.RoleRepository;
import ru.topa.timedelivery.repositories.UserRepository;


@Service
@RequiredArgsConstructor
public class UserDetailService implements UserDetailsService {
    @Autowired
    UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private ClientRepository clientRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }


    public User registerUser(String name, String email, String phone, String password, Role role) {
        User user = new User();
        user.setName(phone);
        user.setPassword(passwordEncoder.encode(password));
        user.addRole(role);

        Client client = new Client();
        client.setPhone(phone);
        client.setName(name);
        client.setEmail(email);
        client.setUser(user);
        clientRepository.save(client);
        return userRepository.save(user);
    }

    public User registerDefaultUser(String name, String email, String phone, String password) {
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.userRole()));

        return registerUser(name, email, phone, password, userRole);
    }

    public User registerCourier(String name, String email, String phone, String password) {
        Role userRole = roleRepository.findByName("ROLE_COURIER")
                .orElseGet(() -> roleRepository.save(Role.courierRole()));

        return registerUser(name, email, phone, password, userRole);
    }

    public User registerModerator(String name, String email, String phone, String password) {
        Role userRole = roleRepository.findByName("ROLE_MODERATOR")
                .orElseGet(() -> roleRepository.save(Role.moderatorRole()));

        return registerUser(name, email, phone, password, userRole);
    }

    public User registerAdmin(String name, String email, String phone, String password) {
        Role userRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.adminRole()));

        return registerUser(name, email, phone, password, userRole);
    }


}