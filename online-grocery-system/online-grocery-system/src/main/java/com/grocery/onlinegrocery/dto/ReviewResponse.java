// 📁 com.grocery.onlinegrocery.dto.ReviewResponse.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long productId;
    private String productName;
    private Long orderId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}