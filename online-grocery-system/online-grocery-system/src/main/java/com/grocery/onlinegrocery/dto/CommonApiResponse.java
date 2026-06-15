// 📁 com.grocery.onlinegrocery.dto.CommonApiResponse.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommonApiResponse {
    
    private boolean success;
    private String message;
    private Object data;
    private LocalDateTime timestamp;
    
    public CommonApiResponse(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    
    public static CommonApiResponse success(String message) {
        return new CommonApiResponse(true, message, null);
    }
    
    public static CommonApiResponse success(String message, Object data) {
        return new CommonApiResponse(true, message, data);
    }
    
    public static CommonApiResponse error(String message) {
        return new CommonApiResponse(false, message, null);
    }
    
    public static CommonApiResponse error(String message, Object data) {
        return new CommonApiResponse(false, message, data);
    }
}