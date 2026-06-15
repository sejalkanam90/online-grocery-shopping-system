// 📁 com.grocery.onlinegrocery.controller.AdminController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.entity.Order;
import com.grocery.onlinegrocery.service.GroceryStoreService;
import com.grocery.onlinegrocery.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {
    
    @Autowired
    private GroceryStoreService groceryStoreService;
    
    @Autowired
    private OrderService orderService;  // ✅ Add this line
    
    // Get all pending shops
    @GetMapping("/pending-shops")
    public ApiResponse getPendingShops() {
        try {
            List<GroceryStore> pendingShops = groceryStoreService.getPendingShops();
            return ApiResponse.success("Pending shops fetched!", pendingShops);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    // Approve shop
    @PutMapping("/approve-shop/{storeId}")
    public ApiResponse approveShop(@PathVariable Long storeId) {
        try {
            GroceryStore store = groceryStoreService.approveShop(storeId);
            return ApiResponse.success("Shop approved successfully!", store);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    // Reject shop
    @PutMapping("/reject-shop/{storeId}")
    public ApiResponse rejectShop(@PathVariable Long storeId) {
        try {
            GroceryStore store = groceryStoreService.rejectShop(storeId);
            return ApiResponse.success("Shop rejected!", store);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    // Get all approved shops
    @GetMapping("/approved-shops")
    public ApiResponse getApprovedShops() {
        try {
            List<GroceryStore> shops = groceryStoreService.getApprovedShops();
            return ApiResponse.success("Approved shops fetched!", shops);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    // Delete shop 
    @DeleteMapping("/shop/{storeId}")
    public ApiResponse deleteShop(@PathVariable Long storeId) {
        try {
            groceryStoreService.deleteShop(storeId);
            return ApiResponse.success("Shop deleted successfully!");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    // ✅ Get all orders (for admin)
    @GetMapping("/orders")
    public ApiResponse getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ApiResponse.success("All orders fetched successfully!", orders);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}