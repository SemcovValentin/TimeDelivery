package ru.topa.timedelivery.entities.persons;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roles")
@Data
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    public static Role userRole() {
        return new Role("ROLE_USER");
    }
    public static Role moderatorRole() {
        return new Role("ROLE_MODERATOR");
    }

    public static Role adminRole() {
        return new Role("ROLE_ADMIN");
    }

    protected Role() {}

    public Role(String name) {
        if (!name.startsWith("ROLE_")) {
            throw new IllegalArgumentException("Role name must start with 'ROLE_'");
        }
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    protected void setName(String name) { this.name = name; }
}
