// 📁 com.grocery.onlinegrocery.dto.UpdateDeliveryStatusRequest.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;

@Data
public class UpdateDeliveryStatusRequest {
    private Long deliveryPersonId;
    private String status;  // AVAILABLE, BUSY, OFFLINE
}