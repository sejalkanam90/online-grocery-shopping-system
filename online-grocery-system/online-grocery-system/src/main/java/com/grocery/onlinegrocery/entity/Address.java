// 📁 com.grocery.onlinegrocery.entity.Address.java

package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "addresses")
public class Address {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String addressType;
    private String addressLine1;
    private String addressLine2;
    private String landmark;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String phoneNumber;
    private String receiverName;
    private boolean isDefault;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}