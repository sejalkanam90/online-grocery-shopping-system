package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ User ID
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // ✅ FIXED: Proper relation with Product
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "order_id")
    private Long orderId;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Transient fields (not stored in database)
    @Transient
    private String userName;

    @Transient
    private String productName;
}