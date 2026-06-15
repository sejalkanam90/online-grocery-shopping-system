// 📁 com.grocery.onlinegrocery.dto.ProductReviewResponseDto.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProductReviewResponseDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long productId;
    private String productName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}