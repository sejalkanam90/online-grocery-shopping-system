package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private BigDecimal price;

    private int quantity;

    private String unit;

    // 🔥 IMPORTANT FIX
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    private String status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grocery_shop_id")
    private GroceryStore groceryShop;

    private String image1;
    private String image2;
    private String image3;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}