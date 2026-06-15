package com.grocery.onlinegrocery.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;  
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_items")
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference  
    private Order order;
    
    @ManyToOne(fetch = FetchType.EAGER)  
    @JoinColumn(name = "product_id")
    private Product product;
    
    private String productName;
    
    private Integer quantity;
    
    private Double price;
    
    private Double total;
    
    @Column(name = "unit")
    private String unit;
}