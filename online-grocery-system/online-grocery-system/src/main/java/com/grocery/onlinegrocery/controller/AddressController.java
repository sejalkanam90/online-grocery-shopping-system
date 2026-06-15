// 📁 com.grocery.onlinegrocery.controller.AddressController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.AddressRequest;
import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.entity.Address;
import com.grocery.onlinegrocery.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "http://localhost:3000")
public class AddressController {
    
    @Autowired
    private AddressService addressService;
    
    @PostMapping("/{userId}/add")
    public ApiResponse addAddress(@PathVariable Long userId, @RequestBody AddressRequest request) {
        try {
            Address address = addressService.addAddress(userId, request);
            return ApiResponse.success("Address added successfully!", address);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/{userId}")
    public ApiResponse getAddresses(@PathVariable Long userId) {
        try {
            List<Address> addresses = addressService.getAddressesByUser(userId);
            return ApiResponse.success("Addresses fetched!", addresses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/{userId}/default")
    public ApiResponse getDefaultAddress(@PathVariable Long userId) {
        try {
            Address address = addressService.getDefaultAddress(userId);
            return ApiResponse.success("Default address found!", address);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PutMapping("/{addressId}")
    public ApiResponse updateAddress(@PathVariable Long addressId, @RequestBody AddressRequest request) {
        try {
            Address address = addressService.updateAddress(addressId, request);
            return ApiResponse.success("Address updated successfully!", address);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PutMapping("/{userId}/set-default/{addressId}")
    public ApiResponse setDefaultAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        try {
            Address address = addressService.setDefaultAddress(userId, addressId);
            return ApiResponse.success("Default address set!", address);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{userId}/{addressId}")
    public ApiResponse deleteAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        try {
            addressService.deleteAddress(userId, addressId);
            return ApiResponse.success("Address deleted successfully!");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}