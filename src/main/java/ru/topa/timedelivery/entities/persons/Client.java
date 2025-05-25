package ru.topa.timedelivery.entities.persons;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.*;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
@Data
@EqualsAndHashCode(exclude = {"user"})
public class Client {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String name;

    @Email(message = "Incorrect email address")
    @Column(unique = true)
    private String email;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String city;

    @Past
    @Column(columnDefinition = "DATE")
    private LocalDate birthday;

    @UpdateTimestamp
    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id",referencedColumnName = "id")
    @JsonBackReference
    private User user;

    @NotBlank
    @Pattern(regexp = "^\\+?[1-9][0-9]{7,14}$",message = "Phone number must be valid")
    @Column(unique = true)
    private String phone;
}
