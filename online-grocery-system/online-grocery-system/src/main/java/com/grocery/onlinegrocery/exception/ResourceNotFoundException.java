// 📁 com.grocery.onlinegrocery.exception.ResourceNotFoundException.java

package com.grocery.onlinegrocery.exception;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id);
    }
    
    public ResourceNotFoundException(String resourceName, String email) {
        super(resourceName + " not found with email: " + email);
    }
}