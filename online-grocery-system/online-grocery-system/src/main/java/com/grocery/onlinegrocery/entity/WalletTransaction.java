package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
    
    private Double amount;
    
    private String type;  // CREDIT, DEBIT
    
    private String description;
    
    private String status;  // SUCCESS, FAILED, PENDING
    
    
    private String razorpayOrderId;      // Razorpay Order ID
    
    private String razorpayPaymentId;    // Razorpay Payment ID
    
    private LocalDateTime createdAt = LocalDateTime.now();
}