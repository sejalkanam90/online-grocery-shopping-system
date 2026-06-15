package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "grocery_stores")
public class GroceryStore {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String storeName;
    private String ownerName;
    private String gstNumber;
    private String address;
    private String city;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private boolean isOpen = true;
    
    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;
    
    private Double rating = 0.0;
    private Integer totalOrders = 0;
    
    @Column(length = 500)
    @JsonProperty("imageUrl")  
    private String imageUrl;
    
    @Column(length = 1000)
    @JsonProperty("description")  
    private String description;
    
    @Column(length = 255)
    @JsonProperty("area")
    private String area;
    
    
    
    @Column(length = 100, unique = true)
    @JsonProperty("email")
    private String email;
    
    @Column(length = 20)
    private String phone;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}