package ru.topa.timedelivery.entities.persons;

import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
@Data
public class Client {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    /*@NotBlank(message = "Name not be empty!")*/
    @Column(columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String surname;

    /*@NotBlank*/
    @Email(message = "Incorrect email address")
    @Column(unique = true)
    private String email;

   /* @NotBlank (message = "Address name not be empty")*/
    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;

    /*@NotBlank (message = "Сity name not be empty!")*/
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
    private User user;

    @NotBlank
    @Pattern(regexp = "^\\+?[1-9][0-9]{7,14}$",message = "Phone number must be valid")
    @Column(unique = true)
    private String phone;

}
