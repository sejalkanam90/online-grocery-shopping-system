// 📁 com.grocery.onlinegrocery.dto.UpdateShopRequest.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;

@Data
public class UpdateShopRequest {
    
    // ✅ For AddGroceryShop - Additional shop details
    private String description;        // Shop description / details
    private String imageUrl;           // Shop image URL
    private String businessEmail;      // Business email (separate from login email)
    private Double latitude;           // Shop location latitude
    private Double longitude;          // Shop location longitude
    private String area;               // Shop area/locality
    private String phone;              // Shop contact number (optional update)
    private String address;            // Shop address (optional update)
    private String city;               // Shop city (optional update)
    private String pincode;            // Shop pincode (optional update)
    
    // Optional: Opening/Closing times if needed to update
    private String openingTime;        // Store opening time
    private String closingTime;        // Store closing time
}