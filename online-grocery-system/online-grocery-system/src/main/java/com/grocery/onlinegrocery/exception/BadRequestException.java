// 📁 com.grocery.onlinegrocery.exception.BadRequestException.java

package com.grocery.onlinegrocery.exception;

public class BadRequestException extends RuntimeException {
    
    public BadRequestException(String message) {
        super(message);
    }
    
    public BadRequestException(String field, String message) {
        super(field + ": " + message);
    }
}