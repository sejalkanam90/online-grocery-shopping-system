// 📁 com.grocery.onlinegrocery.paymentgateway.Metadata.java

package com.grocery.onlinegrocery.paymentgateway;

import lombok.Data;

@Data
public class Metadata {
    private String paymentId;
    private String orderId;
    private String userId;
    private String amount;
    private String timestamp;
    private String source;
    
    public Metadata() {}
    
    public Metadata(String paymentId, String orderId, String userId, String amount) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.timestamp = String.valueOf(System.currentTimeMillis());
    }
}