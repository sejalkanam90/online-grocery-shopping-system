// 📁 com.grocery.onlinegrocery.entity.Cart.java

package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cart")
public class Cart {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    private int quantity;
    
    private LocalDateTime addedAt;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;  
    
    // Getters and Setters
}