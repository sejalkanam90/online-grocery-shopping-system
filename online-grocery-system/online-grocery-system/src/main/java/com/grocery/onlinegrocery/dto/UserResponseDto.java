// 📁 com.grocery.onlinegrocery.dto.UserResponseDto.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;

@Data
public class UserResponseDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String profileImage;
    private boolean active;
    private String createdAt;
}