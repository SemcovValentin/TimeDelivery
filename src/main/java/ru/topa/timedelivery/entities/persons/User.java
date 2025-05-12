package ru.topa.timedelivery.entities.persons;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import ru.topa.timedelivery.entities.orders.Order;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(exclude = {"orders", "client"})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Pattern(regexp = "^\\+?[1-9][0-9]{7,14}$",message = "Phone number must be valid")
    @Column(unique = true)
    private String name;

    @NotBlank
    @Size(min = 6,message = "The password must be at least 6 characters long")
    private String password;

    @CreationTimestamp
    @Column(name = "create_at")
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "user")
    @JsonManagedReference
    private Client client;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference
    private Set<Order> order;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .toList();
    }

    public void addRole(Role role) {
        roles.add(role);
    }

    public void removeRole(Role role) {
        roles.remove(role);
    }

    @Override
    public String getUsername() {
        return name;
    }

    @Override
    public String getPassword() {
        return password;
    }


}
