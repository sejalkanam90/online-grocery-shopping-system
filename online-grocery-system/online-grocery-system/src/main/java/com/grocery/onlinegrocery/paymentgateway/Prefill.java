// 📁 com.grocery.onlinegrocery.paymentgateway.Prefill.java

package com.grocery.onlinegrocery.paymentgateway;

import lombok.Data;

@Data
public class Prefill {
    private String name;
    private String email;
    private String contact;
    private String method;
    
    public Prefill() {}
    
    public Prefill(String name, String email, String contact) {
        this.name = name;
        this.email = email;
        this.contact = contact;
    }
}