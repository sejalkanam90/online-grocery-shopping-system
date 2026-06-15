// 📁 com.grocery.onlinegrocery.exception.UnauthorizedException.java

package com.grocery.onlinegrocery.exception;

public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException() {
        super("You are not authorized to access this resource");
    }
}