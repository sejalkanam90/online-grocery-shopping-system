// 📁 com.grocery.onlinegrocery.resource.UserResource.java

package com.grocery.onlinegrocery.resource;

import com.grocery.onlinegrocery.dto.*;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class UserResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserResource.class);

    @Autowired
    private UserService userService;

    // Register User
    public ResponseEntity<CommonApiResponse> registerUser(RegisterRequest request) {
        LOG.info("Request received for register user");

        try {
            User user = userService.registerUser(request);
            return ResponseEntity.ok(CommonApiResponse.success("User registered successfully", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // Login User
    public ResponseEntity<CommonApiResponse> loginUser(LoginRequest request) {
        LOG.info("Request received for login user");

        try {
            User user = userService.loginUser(request);
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", userService.generateToken(user));

            return ResponseEntity.ok(CommonApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // Get User by ID
    public ResponseEntity<CommonApiResponse> getUserById(Long userId) {
        LOG.info("Request received for get user by id: {}", userId);

        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(CommonApiResponse.success("User found", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // Get All Users (Admin)
    public ResponseEntity<CommonApiResponse> getAllUsers() {
        LOG.info("Request received for get all users");

        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(CommonApiResponse.success("Users fetched", users));
    }

    // ✅ GET DELIVERY PERSONS
    public ResponseEntity<CommonApiResponse> getDeliveryPersons() {
        LOG.info("Request received for get all delivery persons");

        try {
            List<User> deliveryPersons = userService.getUsersByRole(User.Role.DELIVERY);
            return ResponseEntity.ok(CommonApiResponse.success("Delivery persons fetched", deliveryPersons));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // ✅ GET AVAILABLE DELIVERY PERSONS
    public ResponseEntity<CommonApiResponse> getAvailableDeliveryPersons() {
        LOG.info("Request received for get available delivery persons");

        try {
            List<User> deliveryPersons = userService.getAvailableDeliveryPersons();
            return ResponseEntity.ok(CommonApiResponse.success("Available delivery persons fetched", deliveryPersons));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // ✅ UPDATE DELIVERY PERSON STATUS
    public ResponseEntity<CommonApiResponse> updateDeliveryPersonStatus(Long userId, User.DeliveryStatus status) {
        LOG.info("Request received for update delivery person status: {} to {}", userId, status);

        try {
            User deliveryPerson = userService.updateDeliveryStatus(userId, status);
            return ResponseEntity.ok(CommonApiResponse.success("Delivery person status updated", deliveryPerson));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // ✅ UPDATE USER (FIXED)
    public ResponseEntity<CommonApiResponse> updateUser(Long userId, User user) {
        LOG.info("Request received for update user: {}", userId);

        try {
            // Fixed: using updateUserProfile method
            User updatedUser = userService.updateUserProfile(userId, user);
            return ResponseEntity.ok(CommonApiResponse.success("User updated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // Change Password
    public ResponseEntity<CommonApiResponse> changePassword(Long userId, String oldPassword, String newPassword) {
        LOG.info("Request received for change password for user: {}", userId);

        try {
            userService.changePassword(userId, oldPassword, newPassword);
            return ResponseEntity.ok(CommonApiResponse.success("Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // Get Users by Role (Admin)
    public ResponseEntity<CommonApiResponse> getUsersByRole(User.Role role) {
        LOG.info("Request received for get users by role: {}", role);

        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(CommonApiResponse.success("Users fetched", users));
    }

    // Toggle User Status (Admin)
    public ResponseEntity<CommonApiResponse> toggleUserStatus(Long userId) {
        LOG.info("Request received for toggle user status: {}", userId);

        User user = userService.toggleUserStatus(userId);
        return ResponseEntity.ok(CommonApiResponse.success("User status toggled", user));
    }

    // Delete User (Admin)
    public ResponseEntity<CommonApiResponse> deleteUser(Long userId) {
        LOG.info("Request received for delete user: {}", userId);

        userService.deleteUser(userId);
        return ResponseEntity.ok(CommonApiResponse.success("User deleted successfully"));
    }
}