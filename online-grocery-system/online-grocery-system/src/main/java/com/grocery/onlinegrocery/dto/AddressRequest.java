// 📁 com.grocery.onlinegrocery.dto.AddressRequest.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    
    private String addressType;      // HOME, OFFICE, OTHER
    
    private String addressLine1;     // Main address line
    
    private String addressLine2;     // Additional address line (optional)
    
    private String landmark;         // Near by landmark
    
    private String city;             // City name
    
    private String state;            // State name
    
    private String pincode;          // Postal code
    
    private Double latitude;         // Google Maps latitude
    
    private Double longitude;        // Google Maps longitude
    
    private String phoneNumber;      // Contact number for delivery
    
    private String receiverName;     // Receiver's name
    
    private boolean isDefault;       // Set as default address or not
}