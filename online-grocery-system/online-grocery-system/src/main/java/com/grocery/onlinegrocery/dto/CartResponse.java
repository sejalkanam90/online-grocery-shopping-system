package com.grocery.onlinegrocery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private Long productId;
    private String productName;
    private double price;
    private int quantity;
    private double total;

    private String image1;
    private String image2;
    private String image3;
    
    // ✅ ADD THESE
    private String categoryName;
    private String shopName;
}