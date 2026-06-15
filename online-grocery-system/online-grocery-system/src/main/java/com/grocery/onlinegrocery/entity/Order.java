package com.grocery.onlinegrocery.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String orderNumber;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "store_id")
    private GroceryStore store;
    
    @ManyToOne
    @JoinColumn(name = "address_id")
    private Address address;
    
    private Double subtotal;
    
    private Double finalAmount;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus = OrderStatus.PENDING;
    
    private String razorpayOrderId;
    
    private String razorpayPaymentId;
    
    private LocalDateTime scheduledDeliverySlot;
    
    @ManyToOne
    @JoinColumn(name = "delivery_person_id")
    private User deliveryPerson;
    
    private String deliveryNotes;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    private LocalDateTime deliveredAt;
    
    // ✅ ADD THESE TWO FIELDS
    @Column(name = "delivery_rating")
    private Integer deliveryRating;
    
    @Column(name = "delivery_comment", length = 500)
    private String deliveryComment;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();
    
    public enum PaymentMethod {
        WALLET, RAZORPAY, COD
    }
    
    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDED
    }
    
    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, PACKING, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }
}