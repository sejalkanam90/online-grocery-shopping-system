// 📁 com.grocery.onlinegrocery.dto.WalletTopUpRequest.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;

@Data
public class WalletTopUpRequest {
    private double amount;
    private String description;
    private String razorpayPaymentId;
}