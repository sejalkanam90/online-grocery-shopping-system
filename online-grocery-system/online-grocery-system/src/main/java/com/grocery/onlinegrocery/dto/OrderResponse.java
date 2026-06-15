package com.grocery.onlinegrocery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    
    private Long id;
    private String orderNumber;
    private Double subtotal;
    private Double finalAmount;
    private String paymentMethod;
    private String orderStatus;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deliveredAt;
    
    // Store details
    private Long storeId;
    private String storeName;
    
    // User details
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    
    // Address details
    private Long addressId;
    private String addressLine1;
    private String city;
    private String state;
    private String pincode;
    
    // Delivery person details
    private Long deliveryPersonId;
    private String deliveryPersonName;
    private String deliveryPersonPhone;
    
    // Products list
    private List<OrderProductDetail> products;
    
    public static OrderResponse fromOrder(com.grocery.onlinegrocery.entity.Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setSubtotal(order.getSubtotal());
        response.setFinalAmount(order.getFinalAmount());
        
        if (order.getPaymentMethod() != null) {
            response.setPaymentMethod(order.getPaymentMethod().name());
        }
        if (order.getOrderStatus() != null) {
            response.setOrderStatus(order.getOrderStatus().name());
        }
        if (order.getPaymentStatus() != null) {
            response.setPaymentStatus(order.getPaymentStatus().name());
        }
        
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setDeliveredAt(order.getDeliveredAt());
        
        // Store details
        if (order.getStore() != null) {
            response.setStoreId(order.getStore().getId());
            response.setStoreName(order.getStore().getStoreName());
        }
        
        // User details
        if (order.getUser() != null) {
            response.setUserId(order.getUser().getId());
            response.setUserName(order.getUser().getName());
            response.setUserEmail(order.getUser().getEmail());
            response.setUserPhone(order.getUser().getPhone());
        }
        
        // Address details
        if (order.getAddress() != null) {
            response.setAddressId(order.getAddress().getId());
            response.setAddressLine1(order.getAddress().getAddressLine1());
            response.setCity(order.getAddress().getCity());
            response.setState(order.getAddress().getState());
            response.setPincode(order.getAddress().getPincode());
        }
        
        // Delivery person details
        if (order.getDeliveryPerson() != null) {
            response.setDeliveryPersonId(order.getDeliveryPerson().getId());
            response.setDeliveryPersonName(order.getDeliveryPerson().getName());
            response.setDeliveryPersonPhone(order.getDeliveryPerson().getPhone());
        }
        
        return response;
    }
}