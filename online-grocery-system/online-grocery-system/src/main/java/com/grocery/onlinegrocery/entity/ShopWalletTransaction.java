package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "shop_wallet_transactions")
public class ShopWalletTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "shop_wallet_id")
    private ShopWallet shopWallet;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    private Double amount;
    
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.COMPLETED;
    
    private String description;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum TransactionType {
        CREDIT,      // Payment from customer
        DEBIT,       // Refund to customer
        WITHDRAWAL   // Shop owner withdrawal
    }
    
    public enum TransactionStatus {
        PENDING, COMPLETED, FAILED
    }
}