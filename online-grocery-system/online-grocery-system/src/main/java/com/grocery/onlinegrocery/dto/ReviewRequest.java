// 📁 com.grocery.onlinegrocery.dto.ReviewRequest.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long userId;
    private Long productId;
    private Long orderId;
    private Integer rating;
    private String comment;
}