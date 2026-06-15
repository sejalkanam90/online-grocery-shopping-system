// 📁 com.grocery.onlinegrocery.dto.RegisterRequest.java

package com.grocery.onlinegrocery.dto;

import com.grocery.onlinegrocery.entity.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private User.Role role;
    
    // Delivery Person specific fields
    private String aadharNumber;
    private String vehicleType;
    private String vehicleNumber;
    
    // Address fields
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
}