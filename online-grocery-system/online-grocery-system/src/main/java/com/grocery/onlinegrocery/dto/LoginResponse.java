// 📁 com.grocery.onlinegrocery.dto.LoginResponse.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String jwtToken;
    private UserDto user;
    
    @Data
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String role;
        private Long shopId;  
    }
}