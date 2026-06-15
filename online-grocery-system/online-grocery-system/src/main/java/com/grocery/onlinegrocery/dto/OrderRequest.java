package com.grocery.onlinegrocery.dto;

import com.grocery.onlinegrocery.entity.Order;
import lombok.Data;

@Data
public class OrderRequest {
    private Long storeId;
    private Long addressId;
    private Order.PaymentMethod paymentMethod;
    private String deliveryNotes;
}