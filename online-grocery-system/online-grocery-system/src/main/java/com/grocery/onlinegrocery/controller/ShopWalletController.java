// 📁 com.grocery.onlinegrocery.controller.ShopWalletController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.entity.ShopWalletTransaction;
import com.grocery.onlinegrocery.service.ShopWalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shop-wallet")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:8085"})
public class ShopWalletController {

    @Autowired
    private ShopWalletService shopWalletService;

    // ✅ Get wallet balance by shop ID (Path: /api/shop-wallet/{shopId}/balance)
    @GetMapping("/{shopId}/balance")
    @PreAuthorize("hasRole('SHOP') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getWalletBalance(@PathVariable Long shopId) {
        try {
            System.out.println("💰 Fetching shop wallet balance for shopId: " + shopId);
            Double balance = shopWalletService.getBalanceByShopId(shopId);
            System.out.println("💰 Balance: " + balance);
            return ResponseEntity.ok(ApiResponse.success("Balance fetched successfully!", balance));
        } catch (Exception e) {
            System.err.println("❌ Error fetching balance: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ✅ Get all transactions by shop ID (Path: /api/shop-wallet/{shopId}/transactions)
    @GetMapping("/{shopId}/transactions")
    @PreAuthorize("hasRole('SHOP') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getTransactions(@PathVariable Long shopId) {
        try {
            System.out.println("📋 Fetching shop wallet transactions for shopId: " + shopId);
            List<ShopWalletTransaction> transactions = shopWalletService.getTransactionsByShopId(shopId);
            System.out.println("📋 Transactions count: " + (transactions != null ? transactions.size() : 0));
            return ResponseEntity.ok(ApiResponse.success("Transactions fetched successfully!", transactions));
        } catch (Exception e) {
            System.err.println("❌ Error fetching transactions: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ✅ Withdraw money from shop wallet
    @PostMapping("/withdraw")
    @PreAuthorize("hasRole('SHOP') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> withdrawMoney(@RequestBody Map<String, Object> request) {
        try {
            Long shopId = Long.valueOf(request.get("shopId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String description = request.containsKey("description") ? request.get("description").toString() : "Withdrawal request";
            
            System.out.println("💸 Withdrawing ₹" + amount + " from shop wallet ID: " + shopId);
            
            ShopWalletTransaction transaction = shopWalletService.withdrawFromWallet(shopId, amount, description);
            return ResponseEntity.ok(ApiResponse.success("Withdrawal successful!", transaction));
        } catch (Exception e) {
            System.err.println("❌ Withdrawal error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}