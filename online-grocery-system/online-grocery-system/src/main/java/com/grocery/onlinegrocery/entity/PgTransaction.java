package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.grocery.onlinegrocery.entity.Order.PaymentStatus;

@Data
@Entity
@Table(name = "pg_transactions")
public class PgTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 👤 User reference
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // 📦 Internal order id
    @Column(name = "order_id")
    private String orderId;

    // 💳 Razorpay IDs
    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    // 💰 MONEY (IMPORTANT FIX)
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    private String currency;

    // 📊 ENUM instead of String (VERY IMPORTANT)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    // 💳 Payment method
    private String paymentMethod; // UPI, CARD, NETBANKING

    // 🧾 Type of transaction
    private String transactionType; 
    // WALLET_TOPUP, CART_PAYMENT, REFUND

    private String description;

    // ⏱ timestamps
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime paymentDate;

    // 🔥 auto timestamps
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = PaymentStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}