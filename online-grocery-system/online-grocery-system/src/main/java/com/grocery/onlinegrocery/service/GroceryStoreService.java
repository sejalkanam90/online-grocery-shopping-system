// 📁 com.grocery.onlinegrocery.service.GroceryStoreService.java (COMPLETE CODE)

package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.ShopRegisterRequest;
import com.grocery.onlinegrocery.dto.UpdateShopRequest;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.GroceryStoreRepository;
import com.grocery.onlinegrocery.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GroceryStoreService {

    private static final Logger LOG = LoggerFactory.getLogger(GroceryStoreService.class);

    @Autowired
    private GroceryStoreRepository groceryStoreRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Register new shop - Professional Implementation
     * Supports both:
     * 1. New user registration (with password)
     * 2. Existing user adding shop (no password, uses logged-in user)
     */
    @Transactional
    public GroceryStore registerShop(ShopRegisterRequest request) {
        LOG.info("Registering new shop: {}", request.getStoreName());

        User savedUser;

        // ==================== CASE 1: NEW USER REGISTRATION ====================
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            LOG.info("Creating new user account for shop owner");
            
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered. Please use different email or login.");
            }
            
            // Create new user account
            User user = new User();
            user.setName(request.getOwnerName());
            user.setEmail(request.getEmail());      // Personal email for login
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone());
            user.setRole(User.Role.SHOP);
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            savedUser = userRepository.save(user);
            
            LOG.info("Created new user account: {} (ID: {})", savedUser.getEmail(), savedUser.getId());
            
        } else {
            // ==================== CASE 2: EXISTING USER ADDING SHOP ====================
            LOG.info("Existing user adding new shop");
            
            // Get logged in user from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = authentication.getName();
            
            savedUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new RuntimeException("User not found. Please login first."));
            
            LOG.info("Using existing user: {} (ID: {})", savedUser.getEmail(), savedUser.getId());
        }

        // ==================== CREATE GROCERY STORE ====================
        GroceryStore store = new GroceryStore();
        store.setUser(savedUser);
        store.setStoreName(request.getStoreName());
        store.setOwnerName(request.getOwnerName());
        store.setGstNumber(request.getGstNumber());
        store.setAddress(request.getAddress());
        store.setCity(request.getCity());
        store.setPincode(request.getPincode());
        store.setLatitude(request.getLatitude());
        store.setLongitude(request.getLongitude());
        
        // Set opening and closing times
        if (request.getOpeningTime() != null) {
            store.setOpeningTime(request.getOpeningTime());
        }
        if (request.getClosingTime() != null) {
            store.setClosingTime(request.getClosingTime());
        }
        
        // Set image URL if provided
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            store.setImageUrl(request.getImageUrl());
        }
        
        // Set description if provided
        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            store.setDescription(request.getDescription());
        }
        
        // Set area if provided
        if (request.getArea() != null && !request.getArea().isEmpty()) {
            store.setArea(request.getArea());
        }
        
        // ✅ PROFESSIONAL: Business email (can be different from personal email)
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            store.setEmail(request.getEmail());  // Business email for shop contact
            LOG.info("Setting business email: {}", request.getEmail());
        } else {
            store.setEmail(savedUser.getEmail()); // Fallback to personal email
            LOG.info("Using personal email as business email: {}", savedUser.getEmail());
        }
        
        store.setApprovalStatus(GroceryStore.ApprovalStatus.PENDING);
        store.setCreatedAt(LocalDateTime.now());
        store.setUpdatedAt(LocalDateTime.now());
        store.setOpen(true);

        // Save and log
        GroceryStore savedStore = groceryStoreRepository.save(store);
        
        LOG.info("=== SHOP REGISTERED SUCCESSFULLY ===");
        LOG.info("Store Name: {}", savedStore.getStoreName());
        LOG.info("Store ID: {}", savedStore.getId());
        LOG.info("Business Email: {}", savedStore.getEmail());
        LOG.info("Owner Email (Login): {}", savedUser.getEmail());
        LOG.info("Owner Phone: {}", savedUser.getPhone());
        LOG.info("Approval Status: {}", savedStore.getApprovalStatus());
        
        return savedStore;
    }

    // ==================== ✅ NEW METHODS FOR AddGroceryShop ====================

    /**
     * ✅ CRITICAL FIX: Update shop details for AddGroceryShop form
     * This method updates existing shop's additional details like:
     * - Description
     * - Image URL
     * - Business Email
     * - Latitude/Longitude
     * - Area
     * - Phone
     */
    @Transactional
    public GroceryStore updateShopDetails(Long shopId, UpdateShopRequest request) {
        LOG.info("Updating shop details for shop ID: {}", shopId);
        
        // Get existing shop
        GroceryStore store = groceryStoreRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with ID: " + shopId));
        
        // Update description
        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            store.setDescription(request.getDescription());
            LOG.info("Updated description: {}", request.getDescription());
        }
        
        // Update image URL
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            store.setImageUrl(request.getImageUrl());
            LOG.info("Updated image URL: {}", request.getImageUrl());
        }
        
        // Update business email
        if (request.getBusinessEmail() != null && !request.getBusinessEmail().isEmpty()) {
            store.setEmail(request.getBusinessEmail());
            LOG.info("Updated business email: {}", request.getBusinessEmail());
        }
        
        // Update latitude/longitude
        if (request.getLatitude() != null) {
            store.setLatitude(request.getLatitude());
            LOG.info("Updated latitude: {}", request.getLatitude());
        }
        
        if (request.getLongitude() != null) {
            store.setLongitude(request.getLongitude());
            LOG.info("Updated longitude: {}", request.getLongitude());
        }
        
        // Update area
        if (request.getArea() != null && !request.getArea().isEmpty()) {
            store.setArea(request.getArea());
            LOG.info("Updated area: {}", request.getArea());
        }
        
        // Update address if provided
        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            store.setAddress(request.getAddress());
            LOG.info("Updated address: {}", request.getAddress());
        }
        
        // Update city if provided
        if (request.getCity() != null && !request.getCity().isEmpty()) {
            store.setCity(request.getCity());
            LOG.info("Updated city: {}", request.getCity());
        }
        
        // Update pincode if provided
        if (request.getPincode() != null && !request.getPincode().isEmpty()) {
            store.setPincode(request.getPincode());
            LOG.info("Updated pincode: {}", request.getPincode());
        }
        
        // Update phone (in User entity)
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            User user = store.getUser();
            user.setPhone(request.getPhone());
            userRepository.save(user);
            LOG.info("Updated phone: {}", request.getPhone());
        }
        
        // Update opening/closing times if provided
        if (request.getOpeningTime() != null && !request.getOpeningTime().isEmpty()) {
            try {
                store.setOpeningTime(java.time.LocalTime.parse(request.getOpeningTime()));
                LOG.info("Updated opening time: {}", request.getOpeningTime());
            } catch (Exception e) {
                LOG.warn("Invalid opening time format: {}", request.getOpeningTime());
            }
        }
        
        if (request.getClosingTime() != null && !request.getClosingTime().isEmpty()) {
            try {
                store.setClosingTime(java.time.LocalTime.parse(request.getClosingTime()));
                LOG.info("Updated closing time: {}", request.getClosingTime());
            } catch (Exception e) {
                LOG.warn("Invalid closing time format: {}", request.getClosingTime());
            }
        }
        
        store.setUpdatedAt(LocalDateTime.now());
        
        // Save updated shop
        GroceryStore updatedStore = groceryStoreRepository.save(store);
        
        LOG.info("=== SHOP DETAILS UPDATED SUCCESSFULLY ===");
        LOG.info("Shop Name: {}", updatedStore.getStoreName());
        LOG.info("Shop ID: {}", updatedStore.getId());
        LOG.info("Business Email: {}", updatedStore.getEmail());
        LOG.info("Description: {}", updatedStore.getDescription());
        LOG.info("Location: ({}, {})", updatedStore.getLatitude(), updatedStore.getLongitude());
        
        return updatedStore;
    }

    /**
     * ✅ NEW: Update shop details using User ID
     * (Useful when you only have the logged-in user's ID)
     */
    @Transactional
    public GroceryStore updateShopDetailsByUserId(Long userId, UpdateShopRequest request) {
        LOG.info("Updating shop details for user ID: {}", userId);
        
        // Find shop by user ID
        GroceryStore store = groceryStoreRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shop not found for user ID: " + userId));
        
        // Call the update method
        return updateShopDetails(store.getId(), request);
    }

    /**
     * ✅ NEW: Get current logged-in user's shop
     */
    public GroceryStore getCurrentUserShop() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return groceryStoreRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Shop not found for current user"));
    }

    /**
     * ✅ NEW: Check if user has a shop
     */
    public boolean hasShop(Long userId) {
        return groceryStoreRepository.findByUserId(userId).isPresent();
    }

    /**
     * ✅ NEW: Get shop by store name (exact match)
     */
    public Optional<GroceryStore> getShopByStoreName(String storeName) {
        LOG.info("Getting shop by store name: {}", storeName);
        return groceryStoreRepository.findByStoreName(storeName);
    }

    // ==================== EXISTING METHODS ====================

    /**
     * Get Grocery Store by ID
     */
    public GroceryStore getGroceryStoreById(Long storeId) {
        LOG.info("Getting grocery store by id: {}", storeId);
        return groceryStoreRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Grocery Store not found with id: " + storeId));
    }

    /**
     * Get Grocery Store by User ID
     */
    public GroceryStore getShopByUserId(Long userId) {
        LOG.info("Getting shop by user id: {}", userId);
        return groceryStoreRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shop not found for user: " + userId));
    }

    /**
     * Get Grocery Store by Email (Business email)
     */
    public GroceryStore getShopByEmail(String email) {
        LOG.info("Getting shop by email: {}", email);
        return groceryStoreRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Shop not found with email: " + email));
    }

    /**
     * Get all approved shops
     */
    public List<GroceryStore> getApprovedShops() {
        LOG.info("Getting all approved shops");
        return groceryStoreRepository.findByApprovalStatus(GroceryStore.ApprovalStatus.APPROVED);
    }

    /**
     * Get all pending shops (for admin)
     */
    public List<GroceryStore> getPendingShops() {
        LOG.info("Getting all pending shops");
        return groceryStoreRepository.findByApprovalStatus(GroceryStore.ApprovalStatus.PENDING);
    }

    /**
     * Get all rejected shops
     */
    public List<GroceryStore> getRejectedShops() {
        LOG.info("Getting all rejected shops");
        return groceryStoreRepository.findByApprovalStatus(GroceryStore.ApprovalStatus.REJECTED);
    }

    /**
     * Approve shop (Admin)
     */
    @Transactional
    public GroceryStore approveShop(Long storeId) {
        LOG.info("Approving shop: {}", storeId);
        GroceryStore store = getGroceryStoreById(storeId);
        store.setApprovalStatus(GroceryStore.ApprovalStatus.APPROVED);
        store.setUpdatedAt(LocalDateTime.now());
        LOG.info("Shop approved: {}", store.getStoreName());
        return groceryStoreRepository.save(store);
    }

    /**
     * Reject shop (Admin)
     */
    @Transactional
    public GroceryStore rejectShop(Long storeId) {
        LOG.info("Rejecting shop: {}", storeId);
        GroceryStore store = getGroceryStoreById(storeId);
        store.setApprovalStatus(GroceryStore.ApprovalStatus.REJECTED);
        store.setUpdatedAt(LocalDateTime.now());
        LOG.info("Shop rejected: {}", store.getStoreName());
        return groceryStoreRepository.save(store);
    }

    /**
     * Get shops by city
     */
    public List<GroceryStore> getShopsByCity(String city) {
        LOG.info("Getting shops by city: {}", city);
        return groceryStoreRepository.findByCity(city);
    }

    /**
     * Update shop details (full update)
     */
    @Transactional
    public GroceryStore updateShop(Long storeId, GroceryStore updatedStore) {
        LOG.info("Updating shop: {}", storeId);
        GroceryStore store = getGroceryStoreById(storeId);
        
        store.setStoreName(updatedStore.getStoreName());
        store.setAddress(updatedStore.getAddress());
        store.setCity(updatedStore.getCity());
        store.setPincode(updatedStore.getPincode());
        store.setOpeningTime(updatedStore.getOpeningTime());
        store.setClosingTime(updatedStore.getClosingTime());
        
        if (updatedStore.getImageUrl() != null) {
            store.setImageUrl(updatedStore.getImageUrl());
        }
        
        if (updatedStore.getDescription() != null) {
            store.setDescription(updatedStore.getDescription());
        }
        
        if (updatedStore.getArea() != null) {
            store.setArea(updatedStore.getArea());
        }
        
        if (updatedStore.getEmail() != null) {
            store.setEmail(updatedStore.getEmail());
        }
        
        store.setUpdatedAt(LocalDateTime.now());
        
        LOG.info("Shop updated: {}", store.getStoreName());
        return groceryStoreRepository.save(store);
    }

    /**
     * Toggle shop open/close status
     */
    @Transactional
    public GroceryStore toggleShopStatus(Long storeId) {
        LOG.info("Toggling shop status: {}", storeId);
        GroceryStore store = getGroceryStoreById(storeId);
        store.setOpen(!store.isOpen());
        store.setUpdatedAt(LocalDateTime.now());
        String status = store.isOpen() ? "OPENED" : "CLOSED";
        LOG.info("Shop {}: {}", store.getStoreName(), status);
        return groceryStoreRepository.save(store);
    }

    /**
     * Get all shops (admin)
     */
    public List<GroceryStore> getAllShops() {
        LOG.info("Getting all shops");
        return groceryStoreRepository.findAll();
    }

    /**
     * Delete shop (admin)
     */
    @Transactional
    public void deleteShop(Long storeId) {
        LOG.info("Deleting shop: {}", storeId);
        GroceryStore store = getGroceryStoreById(storeId);
        LOG.info("Shop deleted: {}", store.getStoreName());
        groceryStoreRepository.deleteById(storeId);
    }

    /**
     * Update shop image URL
     */
    @Transactional
    public GroceryStore updateShopImage(Long storeId, String imageUrl) {
        LOG.info("Updating shop image: {}", storeId);
        GroceryStore store = getGroceryStoreById(storeId);
        store.setImageUrl(imageUrl);
        store.setUpdatedAt(LocalDateTime.now());
        LOG.info("Shop image updated for: {}", store.getStoreName());
        return groceryStoreRepository.save(store);
    }

    /**
     * Count shops by approval status
     */
    public long countShopsByStatus(GroceryStore.ApprovalStatus status) {
        return groceryStoreRepository.countByApprovalStatus(status);
    }

    /**
     * Get shop by store name (search - contains)
     */
    public List<GroceryStore> searchShopsByName(String name) {
        LOG.info("Searching shops by name: {}", name);
        return groceryStoreRepository.findByStoreNameContainingIgnoreCase(name);
    }

    /**
     * Get open shops
     */
    public List<GroceryStore> getOpenShops() {
        LOG.info("Getting open shops");
        return groceryStoreRepository.findByIsOpenTrue();
    }
}