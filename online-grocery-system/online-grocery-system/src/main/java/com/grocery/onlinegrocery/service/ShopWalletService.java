package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.entity.*;
import com.grocery.onlinegrocery.repository.ShopWalletRepository;
import com.grocery.onlinegrocery.repository.ShopWalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShopWalletService {

    @Autowired
    private ShopWalletRepository shopWalletRepository;

    @Autowired
    private ShopWalletTransactionRepository shopWalletTransactionRepository;

    // ===============================
    // CREATE WALLET FOR NEW SHOP
    // ===============================
    @Transactional
    public ShopWallet createWallet(GroceryStore shop) {
        System.out.println("===== CREATING NEW SHOP WALLET =====");
        System.out.println("Shop ID: " + shop.getId());
        System.out.println("Shop Name: " + shop.getStoreName());
        
        ShopWallet wallet = new ShopWallet();
        wallet.setShop(shop);
        wallet.setBalance(0.0);
        wallet.setCreatedAt(LocalDateTime.now());
        wallet.setUpdatedAt(LocalDateTime.now());
        
        ShopWallet savedWallet = shopWalletRepository.save(wallet);
        System.out.println("✅ Wallet created with ID: " + savedWallet.getId());
        System.out.println("   Initial Balance: ₹0");
        
        return savedWallet;
    }

    // ===============================
    // GET WALLET BY SHOP
    // ===============================
    public ShopWallet getWalletByShop(GroceryStore shop) {
        return shopWalletRepository.findByShop(shop)
                .orElseThrow(() -> new RuntimeException("Wallet not found for shop: " + shop.getStoreName()));
    }

    // ===============================
    // GET WALLET BY SHOP ID
    // ===============================
    public ShopWallet getWalletByShopId(Long shopId) {
        return shopWalletRepository.findByShopId(shopId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for shop id: " + shopId));
    }

    // ===============================
    // GET BALANCE BY SHOP ID
    // ===============================
    public Double getBalanceByShopId(Long shopId) {
        ShopWallet wallet = getWalletByShopId(shopId);
        return wallet.getBalance();
    }

    // ===============================
    // GET TRANSACTIONS BY SHOP
    // ===============================
    public List<ShopWalletTransaction> getTransactionsByShop(GroceryStore shop) {
        ShopWallet wallet = getWalletByShop(shop);
        return shopWalletTransactionRepository.findByShopWalletOrderByCreatedAtDesc(wallet);
    }

    // ===============================
    // GET TRANSACTIONS BY SHOP ID
    // ===============================
    public List<ShopWalletTransaction> getTransactionsByShopId(Long shopId) {
        ShopWallet wallet = getWalletByShopId(shopId);
        return shopWalletTransactionRepository.findByShopWalletOrderByCreatedAtDesc(wallet);
    }

    // ===============================
    // ✅✅✅ CRITICAL: ADD MONEY TO SHOP WALLET (When customer pays) ✅✅✅
    // ===============================
    @Transactional
    public void creditToShopWallet(Order order, Double amount) {
        System.out.println("=========================================");
        System.out.println("📝 INSIDE creditToShopWallet");
        System.out.println("=========================================");
        System.out.println("Order ID: " + order.getId());
        System.out.println("Order Number: " + order.getOrderNumber());
        System.out.println("Amount to Credit: ₹" + amount);
        
        // Get shop from order
        GroceryStore shop = order.getStore();
        if (shop == null) {
            System.err.println("❌ ERROR: Shop is NULL for this order!");
            System.err.println("   Order ID: " + order.getId());
            System.err.println("   Order Number: " + order.getOrderNumber());
            return;
        }
        
        Long shopId = shop.getId();
        String shopName = shop.getStoreName();
        System.out.println("Shop ID: " + shopId);
        System.out.println("Shop Name: " + shopName);
        
        // ✅ Find existing wallet or create new one
        ShopWallet wallet = shopWalletRepository.findByShopId(shopId).orElse(null);
        
        if (wallet == null) {
            System.out.println("⚠️ Wallet not found for shop ID: " + shopId);
            System.out.println("   Creating new wallet...");
            wallet = new ShopWallet();
            wallet.setShop(shop);
            wallet.setBalance(0.0);
            wallet.setCreatedAt(LocalDateTime.now());
            wallet.setUpdatedAt(LocalDateTime.now());
            wallet = shopWalletRepository.save(wallet);
            System.out.println("✅ New wallet created with ID: " + wallet.getId());
        }
        
        // ✅ Update balance
        Double oldBalance = wallet.getBalance();
        Double newBalance = oldBalance + amount;
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        shopWalletRepository.save(wallet);
        
        System.out.println("   Old Balance: ₹" + oldBalance);
        System.out.println("   New Balance: ₹" + newBalance);
        System.out.println("   Amount Added: ₹" + amount);
        
        // ✅ Save transaction record - USING ORDER'S ACTUAL CREATED TIME
        ShopWalletTransaction transaction = new ShopWalletTransaction();
        transaction.setShopWallet(wallet);
        transaction.setOrder(order);
        transaction.setAmount(amount);
        transaction.setType(ShopWalletTransaction.TransactionType.CREDIT);
        transaction.setStatus(ShopWalletTransaction.TransactionStatus.COMPLETED);
        transaction.setDescription("Payment received for Order #" + order.getOrderNumber());
        
        // ✅✅✅ FIX: Use order's actual created time instead of current time ✅✅✅
        transaction.setCreatedAt(order.getCreatedAt());  // ORDER'S ACTUAL DATE & TIME
        
        ShopWalletTransaction savedTransaction = shopWalletTransactionRepository.save(transaction);
        System.out.println("✅ Transaction saved with ID: " + savedTransaction.getId());
        System.out.println("   Transaction Type: CREDIT");
        System.out.println("   Status: COMPLETED");
        System.out.println("   Transaction Created At: " + order.getCreatedAt());  // Show actual order time
        System.out.println("=========================================");
        System.out.println("✅✅✅ SUCCESS: ₹" + amount + " added to SHOP wallet");
        System.out.println("=========================================");
    }

    // ===============================
    // ✅ WITHDRAW MONEY FROM SHOP WALLET
    // ===============================
    @Transactional
    public ShopWalletTransaction withdrawFromWallet(Long shopId, Double amount, String description) {
        System.out.println("=========================================");
        System.out.println("📝 INSIDE withdrawFromWallet");
        System.out.println("=========================================");
        System.out.println("Shop ID: " + shopId);
        System.out.println("Withdrawal Amount: ₹" + amount);
        System.out.println("Description: " + description);
        
        ShopWallet wallet = getWalletByShopId(shopId);
        
        Double currentBalance = wallet.getBalance();
        System.out.println("Current Balance: ₹" + currentBalance);
        
        if (currentBalance < amount) {
            System.err.println("❌ ERROR: Insufficient balance!");
            System.err.println("   Available: ₹" + currentBalance);
            System.err.println("   Requested: ₹" + amount);
            throw new RuntimeException("Insufficient balance. Available: ₹" + currentBalance + ", Requested: ₹" + amount);
        }
        
        Double oldBalance = currentBalance;
        Double newBalance = oldBalance - amount;
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        shopWalletRepository.save(wallet);
        
        System.out.println("   Old Balance: ₹" + oldBalance);
        System.out.println("   New Balance: ₹" + newBalance);
        System.out.println("   Amount Withdrawn: ₹" + amount);
        
        // Save withdrawal transaction
        ShopWalletTransaction transaction = new ShopWalletTransaction();
        transaction.setShopWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType(ShopWalletTransaction.TransactionType.WITHDRAWAL);
        transaction.setStatus(ShopWalletTransaction.TransactionStatus.COMPLETED);
        transaction.setDescription(description);
        transaction.setCreatedAt(LocalDateTime.now());
        
        ShopWalletTransaction savedTransaction = shopWalletTransactionRepository.save(transaction);
        System.out.println("✅ Withdrawal transaction saved with ID: " + savedTransaction.getId());
        System.out.println("   Transaction Type: WITHDRAWAL");
        System.out.println("=========================================");
        System.out.println("✅✅✅ SUCCESS: ₹" + amount + " withdrawn from SHOP wallet");
        System.out.println("=========================================");
        
        return savedTransaction;
    }

    // ===============================
    // DEBIT FROM SHOP WALLET (for refunds, if needed)
    // ===============================
    @Transactional
    public void debitFromShopWallet(Long shopId, Double amount, String description) {
        System.out.println("===== DEBIT FROM SHOP WALLET =====");
        System.out.println("Shop ID: " + shopId);
        System.out.println("Debit Amount: ₹" + amount);
        System.out.println("Description: " + description);
        
        ShopWallet wallet = getWalletByShopId(shopId);
        
        Double oldBalance = wallet.getBalance();
        Double newBalance = oldBalance - amount;
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        shopWalletRepository.save(wallet);
        
        System.out.println("   Old Balance: ₹" + oldBalance);
        System.out.println("   New Balance: ₹" + newBalance);
        
        // Save debit transaction
        ShopWalletTransaction transaction = new ShopWalletTransaction();
        transaction.setShopWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType(ShopWalletTransaction.TransactionType.DEBIT);
        transaction.setStatus(ShopWalletTransaction.TransactionStatus.COMPLETED);
        transaction.setDescription(description);
        transaction.setCreatedAt(LocalDateTime.now());
        shopWalletTransactionRepository.save(transaction);
        
        System.out.println("✅ Debit transaction saved");
        System.out.println("===== DEBIT COMPLETED =====");
    }
}