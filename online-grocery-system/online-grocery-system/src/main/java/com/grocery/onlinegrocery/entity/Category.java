package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grocery_shop_id")
    private Long groceryShopId;

    @ManyToOne
    @JoinColumn(name = "grocery_shop_id", insertable = false, updatable = false)
    private GroceryStore groceryShop;

    private String name;

    private String description;

    private boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}