package com.grocery.onlinegrocery.dto;

import lombok.Data;

@Data
public class OrderProductDetail {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private Double total;
    private String image1;
    private String image2;
    private String image3;
    private String categoryName;
    private String unit;
}