// 📁 com.grocery.onlinegrocery.paymentgateway.RazorPaymentResponse.java

package com.grocery.onlinegrocery.paymentgateway;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RazorPaymentResponse {
    private String orderId;
    private String paymentId;
    private String signature;
    private Double amount;
    private String currency;
    private String status;
    private Long userId;
    private LocalDateTime createdAt;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private ErrorInfo error;
    
    public RazorPaymentResponse() {}
    
    public RazorPaymentResponse(String orderId, String paymentId, String signature, Double amount, Long userId) {
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.signature = signature;
        this.amount = amount;
        this.userId = userId;
        this.currency = "INR";
        this.status = "SUCCESS";
        this.createdAt = LocalDateTime.now();
        this.razorpayOrderId = orderId;
        this.razorpayPaymentId = paymentId;
        this.razorpaySignature = signature;
    }
    
    public boolean isSuccess() {
        return "SUCCESS".equalsIgnoreCase(status) && error == null;
    }
}