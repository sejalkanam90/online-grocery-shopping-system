// 📁 com.grocery.onlinegrocery.controller.ShopController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.ShopRegisterRequest;
import com.grocery.onlinegrocery.dto.UpdateShopRequest;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.UserRepository;
import com.grocery.onlinegrocery.service.GroceryStoreService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8085"
})
public class ShopController {

    @Autowired
    private GroceryStoreService groceryStoreService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Register Grocery Shop (First Step - Basic Registration)
     */
    @PostMapping("/register")
    public ApiResponse registerShop(@RequestBody ShopRegisterRequest request) {
        try {
            GroceryStore store = groceryStoreService.registerShop(request);
            return ApiResponse.success(
                    "Shop registered successfully! Waiting for admin approval.",
                    store
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Update Shop Details for AddGroceryShop (Second Step - Additional Details)
     */
    @PutMapping("/update-details/{shopId}")
    public ResponseEntity<?> updateShopDetails(
            @PathVariable Long shopId,
            @RequestBody UpdateShopRequest request) {
        try {
            GroceryStore updatedShop = groceryStoreService.updateShopDetails(shopId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Shop details updated successfully!");
            response.put("data", updatedShop);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get Current Logged-in User's Shop
     */
    @GetMapping("/my-shop")
    public ResponseEntity<?> getCurrentUserShop() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = authentication.getName();
            
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            GroceryStore shop = groceryStoreService.getShopByUserId(currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", shop);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Update Shop Details using User ID
     */
    @PutMapping("/update-my-shop")
    public ResponseEntity<?> updateMyShopDetails(@RequestBody UpdateShopRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = authentication.getName();
            
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            GroceryStore updatedShop = groceryStoreService.updateShopDetailsByUserId(currentUser.getId(), request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Shop details updated successfully!");
            response.put("data", updatedShop);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get Shop By User Id
     */
    @GetMapping("/user/{userId}")
    public ApiResponse getShopByUserId(@PathVariable Long userId) {
        try {
            GroceryStore store = groceryStoreService.getShopByUserId(userId);
            return ApiResponse.success("Shop found!", store);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Get Shop By Store ID
     */
    @GetMapping("/{storeId}")
    public ApiResponse getShopById(@PathVariable Long storeId) {
        try {
            GroceryStore store = groceryStoreService.getGroceryStoreById(storeId);
            return ApiResponse.success("Shop found!", store);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * ✅ Get Approved Shops - ONLY ACTIVE (OPEN) SHOPS
     * Shop Owner ने Deactivate केल्यानंतर ही shop stores पेजवर दिसणार नाही
     */
    @GetMapping("/approved")
    public ApiResponse getApprovedShops() {
        try {
            List<GroceryStore> shops = groceryStoreService.getApprovedShops();
            
            // ✅ Filter only shops that are OPEN (active)
            List<GroceryStore> activeShops = shops.stream()
                    .filter(shop -> shop.isOpen() == true)
                    .collect(Collectors.toList());
            
            return ApiResponse.success("Active shops fetched successfully!", activeShops);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Get Shops By City - ONLY ACTIVE SHOPS
     */
    @GetMapping("/city/{city}")
    public ApiResponse getShopsByCity(@PathVariable String city) {
        try {
            List<GroceryStore> shops = groceryStoreService.getShopsByCity(city);
            
            // ✅ Filter only approved and open shops
            List<GroceryStore> activeShops = shops.stream()
                    .filter(shop -> shop.getApprovalStatus() == GroceryStore.ApprovalStatus.APPROVED && shop.isOpen())
                    .collect(Collectors.toList());
            
            return ApiResponse.success("Active shops found in " + city, activeShops);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Get Open Shops - ONLY ACTIVE AND APPROVED
     */
    @GetMapping("/open")
    public ApiResponse getOpenShops() {
        try {
            List<GroceryStore> shops = groceryStoreService.getOpenShops();
            
            // ✅ Filter only approved shops
            List<GroceryStore> activeShops = shops.stream()
                    .filter(shop -> shop.getApprovalStatus() == GroceryStore.ApprovalStatus.APPROVED)
                    .collect(Collectors.toList());
            
            return ApiResponse.success("Open shops fetched!", activeShops);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Update Shop (Full Update)
     */
    @PutMapping("/{storeId}")
    public ApiResponse updateShop(
            @PathVariable Long storeId,
            @RequestBody GroceryStore store) {
        try {
            GroceryStore updatedStore = groceryStoreService.updateShop(storeId, store);
            return ApiResponse.success("Shop updated successfully!", updatedStore);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Get All Shops (Admin)
     */
    @GetMapping
    public ApiResponse getAllShops() {
        try {
            List<GroceryStore> shops = groceryStoreService.getAllShops();
            return ApiResponse.success("All shops fetched successfully!", shops);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Toggle Shop Status (Open/Close)
     */
    @PutMapping("/{storeId}/toggle-status")
    public ApiResponse toggleShopStatus(@PathVariable Long storeId) {
        try {
            GroceryStore store = groceryStoreService.toggleShopStatus(storeId);
            String status = store.isOpen() ? "opened" : "closed";
            return ApiResponse.success("Shop " + status + " successfully!", store);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Update Shop Image URL
     */
    @PutMapping("/{storeId}/image")
    public ApiResponse updateShopImage(
            @PathVariable Long storeId,
            @RequestParam String imageUrl) {
        try {
            GroceryStore store = groceryStoreService.updateShopImage(storeId, imageUrl);
            return ApiResponse.success("Shop image updated successfully!", store);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Upload Shop Image File
     */
    @PostMapping("/{storeId}/upload-image")
    public ApiResponse uploadShopImage(
            @PathVariable Long storeId,
            @RequestParam("file") MultipartFile file) {
        try {
            String uploadDir = "uploads/shops/";
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath);

            String imageUrl = "/uploads/shops/" + filename;
            GroceryStore store = groceryStoreService.updateShopImage(storeId, imageUrl);

            return ApiResponse.success("Shop image uploaded successfully!", store);
        } catch (IOException e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to upload image: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Admin: Approve Shop
     */
    @PutMapping("/admin/approve/{storeId}")
    public ApiResponse approveShop(@PathVariable Long storeId) {
        try {
            GroceryStore store = groceryStoreService.approveShop(storeId);
            return ApiResponse.success("Shop approved successfully!", store);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Admin: Reject Shop
     */
    @PutMapping("/admin/reject/{storeId}")
    public ApiResponse rejectShop(@PathVariable Long storeId) {
        try {
            GroceryStore store = groceryStoreService.rejectShop(storeId);
            return ApiResponse.success("Shop rejected!", store);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Admin: Delete Shop
     */
    @DeleteMapping("/admin/{storeId}")
    public ApiResponse deleteShop(@PathVariable Long storeId) {
        try {
            groceryStoreService.deleteShop(storeId);
            return ApiResponse.success("Shop deleted successfully!", null);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Search Shops by Name - ONLY ACTIVE SHOPS
     */
    @GetMapping("/search")
    public ApiResponse searchShopsByName(@RequestParam String name) {
        try {
            List<GroceryStore> shops = groceryStoreService.searchShopsByName(name);
            
            // ✅ Filter only approved and open shops
            List<GroceryStore> activeShops = shops.stream()
                    .filter(shop -> shop.getApprovalStatus() == GroceryStore.ApprovalStatus.APPROVED && shop.isOpen())
                    .collect(Collectors.toList());
            
            return ApiResponse.success("Active shops found!", activeShops);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Get Pending Shops (Admin)
     */
    @GetMapping("/admin/pending")
    public ApiResponse getPendingShops() {
        try {
            List<GroceryStore> shops = groceryStoreService.getPendingShops();
            return ApiResponse.success("Pending shops fetched!", shops);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Get Rejected Shops (Admin)
     */
    @GetMapping("/admin/rejected")
    public ApiResponse getRejectedShops() {
        try {
            List<GroceryStore> shops = groceryStoreService.getRejectedShops();
            return ApiResponse.success("Rejected shops fetched!", shops);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }
}