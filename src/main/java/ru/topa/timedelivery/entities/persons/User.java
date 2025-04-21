package ru.topa.timedelivery.entities.persons;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Pattern(regexp = "^\\+?[1-9][0-9]{7,14}$",message = "Phone number must be valid")
    @Column(unique = true)
    private String phone;

    @NotBlank
    @Size(min = 6, max = 20,message = "Password must be between 6 and 20 characters")
    private String password;

    @CreationTimestamp
    @Column(name = "create_at")
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "user")
    private Client client;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();
}
