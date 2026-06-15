// 📁 com.grocery.onlinegrocery.entity.DeliveryAddress.java

package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "delivery_addresses")
public class DeliveryAddress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
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
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}