package com.grocery.onlinegrocery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartRequest {
    private Long userId;
    private Long productId;
    private Integer quantity;
}