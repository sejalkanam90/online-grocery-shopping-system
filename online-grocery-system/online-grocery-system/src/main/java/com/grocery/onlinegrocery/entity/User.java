// 📁 com.grocery.onlinegrocery.entity.User.java

package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    // =========================
    // USER ID
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // BASIC DETAILS
    // =========================
    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String phone;

    // =========================
    // USER ROLE
    // =========================
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.CUSTOMER;

    // =========================
    // ACCOUNT STATUS
    // =========================
    private boolean active = true;

    private String profileImage;

    // =========================
    // ADDRESS DETAILS
    // =========================
    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 10)
    private String pincode;

    @Column(length = 255)
    private String landmark;

    // =========================
    // DELIVERY PERSON DETAILS
    // =========================

    // Aadhar Number
    @Column(name = "aadhar_number", length = 20)
    private String aadharNumber;

    // Vehicle Type
    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    // Vehicle Number
    @Column(name = "vehicle_number", length = 50)
    private String vehicleNumber;

    // Delivery Status
    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus = DeliveryStatus.AVAILABLE;

    // =========================
    // TIMESTAMPS
    // =========================
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    // =========================
    // TRANSIENT FIELDS
    // =========================
    @Transient
    private String groceryShop;

    // =========================
    // ENUMS
    // =========================
    public enum Role {
        ADMIN,
        SHOP,
        CUSTOMER,
        DELIVERY
    }

    public enum DeliveryStatus {
        AVAILABLE,
        BUSY,
        OFFLINE
    }

    // =========================
    // AADHAR GETTER
    // =========================
    public String getAadharNumber() {

        if (this.role == Role.DELIVERY) {
            return aadharNumber;
        }

        return null;
    }

    // =========================
    // AADHAR SETTER
    // =========================
    public void setAadharNumber(String aadharNumber) {

        if (this.role == Role.DELIVERY) {
            this.aadharNumber = aadharNumber;
        }
    }

    // =========================
    // AUTO UPDATE TIMESTAMP
    // =========================
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}