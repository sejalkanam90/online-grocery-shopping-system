package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.entity.DeliveryPersonShop;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.GroceryStoreRepository;
import com.grocery.onlinegrocery.service.DeliveryPersonShopService;
import com.grocery.onlinegrocery.service.UserService;
import com.grocery.onlinegrocery.utility.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8085"
})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private DeliveryPersonShopService deliveryPersonShopService;

    @Autowired
    private GroceryStoreRepository groceryStoreRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ===============================
    // GET ALL USERS
    // ===============================
    @GetMapping
    public ApiResponse getAllUsers() {

        try {

            List<User> users = userService.getAllUsers();

            for (User user : users) {

                if (user.getRole() == User.Role.DELIVERY) {

                    setDeliveryPersonShop(user);
                }
            }

            return ApiResponse.success("Users fetched successfully!", users);

        } catch (Exception e) {

            e.printStackTrace();

            return ApiResponse.error(e.getMessage());
        }
    }

    // ===============================
    // GET DELIVERY PERSONS
    // ===============================
    @GetMapping("/delivery-persons")
    public ResponseEntity<ApiResponse> getDeliveryPersons() {

        try {

            List<User> deliveryPersons =
                    userService.getUsersByRole(User.Role.DELIVERY);

            for (User user : deliveryPersons) {

                setDeliveryPersonShop(user);
            }

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Delivery persons fetched!",
                            deliveryPersons
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // GET AVAILABLE DELIVERY PERSONS
    // ===============================
    @GetMapping("/delivery-persons/available")
    public ResponseEntity<ApiResponse> getAvailableDeliveryPersons() {

        try {

            List<User> deliveryPersons =
                    userService.getAvailableDeliveryPersons();

            for (User user : deliveryPersons) {

                setDeliveryPersonShop(user);
            }

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Available delivery persons fetched!",
                            deliveryPersons
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // UPDATE DELIVERY PERSON STATUS
    // ===============================
    @PutMapping("/delivery-persons/{id}/status")
    public ResponseEntity<ApiResponse> updateDeliveryPersonStatus(
            @PathVariable Long id,
            @RequestParam User.DeliveryStatus status) {

        try {

            User deliveryPerson =
                    userService.updateDeliveryStatus(id, status);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Delivery person status updated!",
                            deliveryPerson
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // GET CURRENT USER PROFILE
    // ===============================
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false)
            String authHeader) {

        try {

            Long currentUserId = getUserIdFromToken(authHeader);

            if (currentUserId == null) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(
                                "Invalid or missing token"
                        ));
            }

            User user = userService.getUserById(currentUserId);

            if (user == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            if (user.getRole() == User.Role.DELIVERY) {

                setDeliveryPersonShop(user);
            }

            // Hide password
            user.setPassword(null);

            return ResponseEntity.ok(
                    ApiResponse.success("User found!", user)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            "Server error: " + e.getMessage()
                    ));
        }
    }

    // ===============================
    // GET USER BY ID
    // ===============================
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getUser(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false)
            String authHeader) {

        try {

            Long currentUserId = getUserIdFromToken(authHeader);

            if (currentUserId == null) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(
                                "Invalid or missing token"
                        ));
            }

            User currentUser = userService.getUserById(currentUserId);

            User requestedUser = userService.getUserById(id);

            if (requestedUser == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            boolean isOwnProfile =
                    currentUserId.equals(id);

            boolean isAdmin =
                    currentUser != null &&
                    currentUser.getRole() == User.Role.ADMIN;

            if (!isOwnProfile && !isAdmin) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(
                                "You don't have permission to view this profile"
                        ));
            }

            if (requestedUser.getRole() == User.Role.DELIVERY) {

                setDeliveryPersonShop(requestedUser);
            }

            requestedUser.setPassword(null);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "User found!",
                            requestedUser
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            "Server error: " + e.getMessage()
                    ));
        }
    }

    // ===============================
    // UPDATE USER PROFILE
    // ===============================
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateUser(
            @PathVariable Long id,
            @RequestBody User user,
            @RequestHeader(value = "Authorization", required = false)
            String authHeader) {

        try {

            Long currentUserId = getUserIdFromToken(authHeader);

            if (currentUserId == null) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(
                                "Invalid or missing token"
                        ));
            }

            if (!currentUserId.equals(id)) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(
                                "You can only update your own profile"
                        ));
            }

            User existingUser =
                    userService.getUserById(id);

            if (existingUser == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            if (existingUser.getRole() != User.Role.DELIVERY) {

                user.setAadharNumber(null);
                user.setVehicleType(null);
                user.setVehicleNumber(null);
            }

            User updatedUser =
                    userService.updateUserProfile(id, user);

            updatedUser.setPassword(null);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "User updated successfully!",
                            updatedUser
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            "Server error: " + e.getMessage()
                    ));
        }
    }

    // ===============================
    // CHANGE PASSWORD
    // ===============================
    @PostMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword,
            @RequestHeader(value = "Authorization", required = false)
            String authHeader) {

        try {

            Long currentUserId = getUserIdFromToken(authHeader);

            if (currentUserId == null ||
                    !currentUserId.equals(id)) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(
                                "Unauthorized. Please login again."
                        ));
            }

            userService.changePassword(
                    id,
                    oldPassword,
                    newPassword
            );

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Password changed successfully!"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            "Server error: " + e.getMessage()
                    ));
        }
    }

    // ===============================
    // SET DELIVERY PERSON SHOP
    // ===============================
    private void setDeliveryPersonShop(User user) {

        List<DeliveryPersonShop> assignedShops =
                deliveryPersonShopService.getByDeliveryPersonId(
                        user.getId()
                );

        if (!assignedShops.isEmpty()) {

            Long shopId = assignedShops.get(0).getShopId();

            GroceryStore shop =
                    groceryStoreRepository.findById(shopId)
                            .orElse(null);

            if (shop != null) {

                user.setGroceryShop(shop.getStoreName());

            } else {

                user.setGroceryShop("Not Assigned");
            }

        } else {

            user.setGroceryShop("Not Assigned");
        }
    }

    // ===============================
    // EXTRACT USER ID FROM TOKEN
    // ===============================
    private Long getUserIdFromToken(String authHeader) {

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println("❌ No Bearer token found");

            return null;
        }

        try {

            String token = authHeader.substring(7);

            System.out.println(
                    "🔵 Token received: " +
                    token.substring(
                            0,
                            Math.min(20, token.length())
                    ) + "..."
            );

            Long userId = jwtUtil.extractUserId(token);

            if (userId == null) {

                System.out.println(
                        "❌ User ID not found in token"
                );

                return null;
            }

            System.out.println(
                    "✅ User ID From Token: " + userId
            );

            return userId;

        } catch (Exception e) {

            System.out.println(
                    "❌ Token Parse Error: " + e.getMessage()
            );

            e.printStackTrace();

            return null;
        }
    }
}