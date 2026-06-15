package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "delivery_person_shops")
public class DeliveryPersonShop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long deliveryPersonId;
    
    private Long shopId;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    
    private LocalDateTime requestedAt;
    
    private LocalDateTime approvedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}