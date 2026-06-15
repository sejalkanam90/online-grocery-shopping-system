// 📁 com.grocery.onlinegrocery.paymentgateway.ErrorInfo.java

package com.grocery.onlinegrocery.paymentgateway;

import lombok.Data;

@Data
public class ErrorInfo {
    private String code;
    private String description;
    private String field;
    private String source;
    private String step;
    private String reason;
    private Object metadata;
    
    public ErrorInfo() {}
    
    public ErrorInfo(String code, String description) {
        this.code = code;
        this.description = description;
    }
}