// 📁 com.grocery.onlinegrocery.dto.ProductDetailUpdateRequest.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductDetailUpdateRequest {
    private Long productId;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private Long categoryId;
}