// 📁 com.grocery.onlinegrocery.dto.UserLoginResponse.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;

@Data
public class UserLoginResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String phone;
    private boolean success;
    private String message;
}