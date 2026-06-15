// 📁 com.grocery.onlinegrocery.paymentgateway.Notes.java

package com.grocery.onlinegrocery.paymentgateway;

import lombok.Data;

@Data
public class Notes {
    private String userId;
    private String walletTopup;
    private String source;
    private String merchantId;
    private String orderType;
    
    public Notes() {}
    
    public Notes(String userId, String walletTopup) {
        this.userId = userId;
        this.walletTopup = walletTopup;
        this.source = "ONLINE_GROCERY_APP";
        this.orderType = "WALLET_TOPUP";
    }
}