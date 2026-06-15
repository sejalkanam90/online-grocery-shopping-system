package com.grocery.onlinegrocery.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class ShopRegisterRequest {
    // User details
    private String ownerName;
    private String email;
    private String password;
    private String phone;
    
    // Shop details
    private String storeName;
    private String gstNumber;
    private String address;
    private String city;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private LocalTime openingTime;
    private LocalTime closingTime;
    
    // Image and description
    private String imageUrl;
    private String description;
    
   
    private String area;
  
}