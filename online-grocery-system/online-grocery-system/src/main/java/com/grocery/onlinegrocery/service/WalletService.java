package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.entity.Wallet;
import com.grocery.onlinegrocery.entity.WalletTransaction;
import com.grocery.onlinegrocery.repository.WalletRepository;
import com.grocery.onlinegrocery.repository.WalletTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WalletService {

    private static final Logger LOG = LoggerFactory.getLogger(WalletService.class);

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    private UserService userService;

    // Create wallet for user
    public Wallet createWallet(Long userId) {
        LOG.info("Creating wallet for user: {}", userId);
        
        User user = userService.getUserById(userId);
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(0.0);
        wallet.setCreatedAt(LocalDateTime.now());
        wallet.setUpdatedAt(LocalDateTime.now());
        
        return walletRepository.save(wallet);
    }

    // Get wallet by user
    public Wallet getWalletByUser(Long userId) {
        LOG.info("Getting wallet for user: {}", userId);
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));
    }

    // Get balance
    public double getBalance(Long userId) {
        LOG.info("Getting balance for user: {}", userId);
        return getWalletByUser(userId).getBalance();
    }

    // Add money to wallet (Regular method)
    @Transactional
    public Wallet addMoney(Long userId, double amount, String description) {
        LOG.info("Adding money to wallet. User: {}, Amount: {}", userId, amount);
        
        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }
        
        Wallet wallet = getWalletByUser(userId);
        double newBalance = wallet.getBalance() + amount;
        
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        wallet = walletRepository.save(wallet);
        
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType("CREDIT");
        transaction.setDescription(description);
        transaction.setStatus("SUCCESS");
        transaction.setRazorpayPaymentId(null);
        transaction.setRazorpayOrderId(null);
        transaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepository.save(transaction);
        
        LOG.info("Money added successfully. New balance: {}", newBalance);
        return wallet;
    }

    // Add money via Razorpay (after successful payment)
    @Transactional
    public Wallet addMoneyViaRazorpay(Long userId, double amount, String paymentId, String orderId) {
        LOG.info("Adding money via Razorpay. User: {}, Amount: {}, PaymentId: {}", userId, amount, paymentId);
        
        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }
        
        Wallet wallet = getWalletByUser(userId);
        double newBalance = wallet.getBalance() + amount;
        
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        wallet = walletRepository.save(wallet);
        
        // Create transaction record with Razorpay details
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType("CREDIT");
        transaction.setDescription("Wallet topup via Razorpay");
        transaction.setStatus("SUCCESS");
        transaction.setRazorpayPaymentId(paymentId);
        transaction.setRazorpayOrderId(orderId);
        transaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepository.save(transaction);
        
        LOG.info("Money added via Razorpay successfully. New balance: {}", newBalance);
        return wallet;
    }

    // Deduct money from wallet (for cart payment after Razorpay)
    @Transactional
    public Wallet deductMoneyViaRazorpay(Long userId, double amount, String paymentId, String orderId) {
        LOG.info("Deducting money via Razorpay. User: {}, Amount: {}, PaymentId: {}", userId, amount, paymentId);
        
        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }
        
        Wallet wallet = getWalletByUser(userId);
        
        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient wallet balance");
        }
        
        double newBalance = wallet.getBalance() - amount;
        
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        wallet = walletRepository.save(wallet);
        
        // Create transaction record with Razorpay details
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType("DEBIT");
        transaction.setDescription("Order payment via Razorpay");
        transaction.setStatus("SUCCESS");
        transaction.setRazorpayPaymentId(paymentId);
        transaction.setRazorpayOrderId(orderId);
        transaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepository.save(transaction);
        
        LOG.info("Money deducted via Razorpay successfully. New balance: {}", newBalance);
        return wallet;
    }

    // Alias method for deductMoney (for controller compatibility)
    @Transactional
    public Wallet deductMoney(Long userId, double amount, String paymentId, String orderId) {
        return deductMoneyViaRazorpay(userId, amount, paymentId, orderId);
    }

    // Debit from wallet (legacy method for cart payment without Razorpay)
    @Transactional
    public Wallet debitFromWallet(Long userId, double amount, String description) {
        LOG.info("Debiting from wallet. User: {}, Amount: {}", userId, amount);
        
        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }
        
        Wallet wallet = getWalletByUser(userId);
        
        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient wallet balance");
        }
        
        double newBalance = wallet.getBalance() - amount;
        
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        wallet = walletRepository.save(wallet);
        
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType("DEBIT");
        transaction.setDescription(description);
        transaction.setStatus("SUCCESS");
        transaction.setRazorpayPaymentId(null);
        transaction.setRazorpayOrderId(null);
        transaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepository.save(transaction);
        
        LOG.info("Debited successfully. New balance: {}", newBalance);
        return wallet;
    }

    // Credit to wallet (refund)
    @Transactional
    public Wallet creditToWallet(Long userId, double amount, String description) {
        return addMoney(userId, amount, description);
    }

    // Get wallet transactions
    public List<WalletTransaction> getTransactions(Long userId) {
        LOG.info("Getting transactions for user: {}", userId);
        
        Wallet wallet = getWalletByUser(userId);
        return walletTransactionRepository.findByWalletOrderByCreatedAtDesc(wallet);
    }

    // Check sufficient balance
    public boolean hasSufficientBalance(Long userId, double amount) {
        double balance = getBalance(userId);
        return balance >= amount;
    }
}