package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.WalletTopUpRequest;
import com.grocery.onlinegrocery.entity.Wallet;
import com.grocery.onlinegrocery.entity.WalletTransaction;
import com.grocery.onlinegrocery.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:8085"})
public class WalletController {

    @Autowired
    private WalletService walletService;

    // 1️⃣ Get wallet balance
    @GetMapping("/{userId}/balance")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SHOP') or hasRole('ADMIN')")
    public ApiResponse getBalance(@PathVariable Long userId) {
        try {
            double balance = walletService.getBalance(userId);
            return ApiResponse.success("Balance fetched!", balance);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 2️⃣ Add money to wallet (regular - fake payment)
    @PostMapping("/{userId}/topup")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SHOP')")
    public ApiResponse topUpWallet(@PathVariable Long userId, @RequestBody WalletTopUpRequest request) {
        try {
            Wallet wallet = walletService.addMoney(userId, request.getAmount(), request.getDescription());
            return ApiResponse.success("Money added to wallet successfully!", wallet);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 3️⃣ Razorpay Top-up (after payment verification)
    @PostMapping("/{userId}/razorpay-topup")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SHOP')")
    public ApiResponse razorpayTopup(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request) {
        try {
            double amount = Double.parseDouble(request.get("amount").toString());
            String paymentId = (String) request.get("razorpayPaymentId");
            String orderId = (String) request.get("razorpayOrderId");

            Wallet wallet = walletService.addMoneyViaRazorpay(userId, amount, paymentId, orderId);
            return ApiResponse.success("Money added to wallet successfully!", wallet);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 4️⃣ Deduct money from wallet (for cart payment)
    @PostMapping("/{userId}/deduct")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse deductMoney(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request) {
        try {
            double amount = Double.parseDouble(request.get("amount").toString());
            String orderId = (String) request.get("orderId");
            String paymentId = (String) request.get("razorpayPaymentId");

            Wallet wallet = walletService.deductMoneyViaRazorpay(userId, amount, paymentId, orderId);
            return ApiResponse.success("Money deducted successfully!", wallet);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // 5️⃣ Get wallet transactions
    @GetMapping("/{userId}/transactions")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SHOP') or hasRole('ADMIN')")
    public ApiResponse getTransactions(@PathVariable Long userId) {
        try {
            List<WalletTransaction> transactions = walletService.getTransactions(userId);
            return ApiResponse.success("Transactions fetched!", transactions);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}