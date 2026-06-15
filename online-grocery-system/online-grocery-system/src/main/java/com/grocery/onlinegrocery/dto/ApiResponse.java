// 📁 com.grocery.onlinegrocery.dto.ApiResponse.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {
    
    private boolean success;
    private String message;
    private Object data;
    private LocalDateTime timestamp;
    
 
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.data = null;
        this.timestamp = LocalDateTime.now();
    }
    
    
    public ApiResponse(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    
    // Static helper methods
    public static ApiResponse success(String message) {
        return new ApiResponse(true, message, null);
    }
    
    public static ApiResponse success(String message, Object data) {
        return new ApiResponse(true, message, data);
    }
    
    public static ApiResponse error(String message) {
        return new ApiResponse(false, message, null);
    }
    
    public static ApiResponse error(String message, Object data) {
        return new ApiResponse(false, message, data);
    }
}