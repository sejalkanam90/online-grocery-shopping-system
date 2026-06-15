// 📁 com.grocery.onlinegrocery.paymentgateway.Theme.java

package com.grocery.onlinegrocery.paymentgateway;

import lombok.Data;

@Data
public class Theme {
    private String color;
    private String backgroundColor;
    private String textColor;
    private String backButtonColor;
    private Boolean hideTopBar;
    
    public Theme() {
        this.color = "#059669";
        this.backgroundColor = "#FFFFFF";
        this.textColor = "#1F2937";
        this.backButtonColor = "#374151";
        this.hideTopBar = false;
    }
    
    public Theme(String color) {
        this.color = color;
        this.backgroundColor = "#FFFFFF";
        this.textColor = "#1F2937";
        this.backButtonColor = "#374151";
        this.hideTopBar = false;
    }
}