// 📁 com.grocery.onlinegrocery.paymentgateway.RazorPaymentRequest.java

package com.grocery.onlinegrocery.paymentgateway;

import lombok.Data;

@Data
public class RazorPaymentRequest {
    private Long amount;
    private String currency;
    private String receipt;
    private String paymentCapture;
    private Long userId;
    private String description;
    private Notes notes;
    private Prefill prefill;
    private Theme theme;
    private Metadata metadata;
    
    public RazorPaymentRequest() {
        this.currency = "INR";
        this.paymentCapture = "1";
    }
    
    public RazorPaymentRequest(Long amount, Long userId, String name, String email, String phone) {
        this.amount = amount;
        this.userId = userId;
        this.currency = "INR";
        this.paymentCapture = "1";
        this.receipt = "receipt_" + System.currentTimeMillis();
        this.description = "Wallet Top-up of ₹" + amount;
        this.notes = new Notes(String.valueOf(userId), "WALLET_TOPUP");
        this.prefill = new Prefill(name, email, phone);
        this.theme = new Theme("#059669");
    }
}