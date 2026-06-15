// 📁 com.grocery.onlinegrocery.exception.ErrorResponse.java

package com.grocery.onlinegrocery.exception;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    private boolean success;
    private String message;
    private String errorCode;
    private int status;
    private LocalDateTime timestamp;
    private String path;
    
    public ErrorResponse(String message, int status, String path) {
        this.success = false;
        this.message = message;
        this.status = status;
        this.timestamp = LocalDateTime.now();
        this.path = path;
    }
    
    public ErrorResponse(String message, String errorCode, int status, String path) {
        this.success = false;
        this.message = message;
        this.errorCode = errorCode;
        this.status = status;
        this.timestamp = LocalDateTime.now();
        this.path = path;
    }
}