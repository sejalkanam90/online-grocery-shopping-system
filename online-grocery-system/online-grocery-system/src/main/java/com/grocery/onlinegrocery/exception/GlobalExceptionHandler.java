// 📁 com.grocery.onlinegrocery.exception.GlobalExceptionHandler.java

package com.grocery.onlinegrocery.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // Handle Resource Not Found (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "RESOURCE_NOT_FOUND",
            HttpStatus.NOT_FOUND.value(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    // Handle Duplicate Resource (409)
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(DuplicateResourceException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "DUPLICATE_RESOURCE",
            HttpStatus.CONFLICT.value(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }
    
    // Handle Unauthorized (401)
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "UNAUTHORIZED",
            HttpStatus.UNAUTHORIZED.value(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }
    
    // Handle Bad Request (400)
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "BAD_REQUEST",
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
    
    // Handle Bad Credentials (401) - Login failed
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            "Invalid email or password",
            "INVALID_CREDENTIALS",
            HttpStatus.UNAUTHORIZED.value(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }
    
    // Handle Access Denied (403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            "You don't have permission to access this resource",
            "ACCESS_DENIED",
            HttpStatus.FORBIDDEN.value(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }
    
    // Handle Validation Errors (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Validation failed");
        response.put("errors", errors);
        response.put("timestamp", java.time.LocalDateTime.now());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    // Handle Generic Exception (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            "An unexpected error occurred: " + ex.getMessage(),
            "INTERNAL_SERVER_ERROR",
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // Handle Runtime Exception
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "RUNTIME_ERROR",
            HttpStatus.BAD_REQUEST.value(),
            request.getDescription(false)
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}