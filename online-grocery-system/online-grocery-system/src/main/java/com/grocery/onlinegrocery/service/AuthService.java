// 📁 com.grocery.onlinegrocery.service.AuthService.java

package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.LoginRequest;
import com.grocery.onlinegrocery.dto.LoginResponse;
import com.grocery.onlinegrocery.dto.RegisterRequest;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.GroceryStoreRepository;
import com.grocery.onlinegrocery.repository.UserRepository;
import com.grocery.onlinegrocery.utility.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroceryStoreRepository groceryStoreRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Login User - Returns JWT token with user details including shopId for SHOP role
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        
        if (userOptional.isEmpty()) {
            logger.error("User not found with email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOptional.get();

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.error("Invalid password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive()) {
            logger.error("User account is deactivated: {}", request.getEmail());
            throw new RuntimeException("Your account has been deactivated. Please contact admin.");
        }

        // Generate JWT token
        String jwtToken = jwtUtil.generateToken(user.getEmail());

        // Build response
        LoginResponse response = new LoginResponse();
        response.setJwtToken(jwtToken);

        LoginResponse.UserDto userDto = new LoginResponse.UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setPhone(user.getPhone());
        userDto.setRole(user.getRole().name());

        // ✅ For SHOP role, fetch and set shopId
        if (user.getRole() == User.Role.SHOP) {
            Optional<GroceryStore> shopOptional = groceryStoreRepository.findByUserId(user.getId());
            if (shopOptional.isPresent()) {
                GroceryStore shop = shopOptional.get();
                userDto.setShopId(shop.getId());
                logger.info("Shop found for user {}: shopId={}", user.getId(), shop.getId());
            } else {
                logger.warn("No shop found for SHOP user: {}", user.getId());
                userDto.setShopId(null);
            }
        }

        response.setUser(userDto);
        
        logger.info("Login successful for user: {} with role: {}", user.getEmail(), user.getRole());
        
        return response;
    }

    /**
     * Register new User (Customer)
     */
    @Transactional
    public User registerCustomer(RegisterRequest request) {
        logger.info("Registering new customer: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(User.Role.CUSTOMER);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        
        logger.info("Customer registered successfully: {}", savedUser.getEmail());
        
        return savedUser;
    }

    /**
     * Register new Shop Owner (with shop creation)
     * This method is called from ShopController
     */
    @Transactional
    public User registerShopOwner(RegisterRequest request) {
        logger.info("Registering new shop owner: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(User.Role.SHOP);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        
        logger.info("Shop owner registered successfully: {}", savedUser.getEmail());
        
        return savedUser;
    }

    /**
     * Register new Delivery Person
     */
    @Transactional
    public User registerDelivery(RegisterRequest request) {
        logger.info("Registering new delivery person: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(User.Role.DELIVERY);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        
        logger.info("Delivery person registered successfully: {}", savedUser.getEmail());
        
        return savedUser;
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            String email = jwtUtil.extractUsername(token);
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                return jwtUtil.validateToken(token, userOptional.get().getEmail());
            }
            return false;
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    /**
     * Check if user is active
     */
    public boolean isUserActive(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        return userOptional.map(User::isActive).orElse(false);
    }

    /**
     * Logout (invalidate token - client side only, just for logging)
     */
    public void logout(String token) {
        logger.info("User logged out");
        // Token invalidation is handled client-side
        // Backend can optionally add token to blacklist
    }
}