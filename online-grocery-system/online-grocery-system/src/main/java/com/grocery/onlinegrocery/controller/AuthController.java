// 📁 com.grocery.onlinegrocery.controller.AuthController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.LoginRequest;
import com.grocery.onlinegrocery.dto.RegisterRequest;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ApiResponse register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);
            return ApiResponse.success("User registered successfully!", user);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ApiResponse login(@RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request);
            String token = userService.generateToken(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);
            
            return ApiResponse.success("Login successful!", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}