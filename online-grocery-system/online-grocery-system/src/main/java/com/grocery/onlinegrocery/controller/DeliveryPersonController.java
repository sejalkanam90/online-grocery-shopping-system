// 📁 com.grocery.onlinegrocery.controller.DeliveryPersonController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.DeliveryShopRequestDTO;
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

import java.util.*;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8085"
})
public class DeliveryPersonController {

    @Autowired
    private UserService userService;

    @Autowired
    private DeliveryPersonShopService deliveryPersonShopService;

    @Autowired
    private GroceryStoreRepository groceryStoreRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ================= GET REQUESTS BY DELIVERY PERSON =================

    @GetMapping("/requests/delivery-person/{deliveryPersonId}")
    public ResponseEntity<ApiResponse> getRequestsByDeliveryPerson(
            @PathVariable Long deliveryPersonId) {

        try {

            List<DeliveryPersonShop> requests =
                    deliveryPersonShopService.getRequestsByDeliveryPerson(deliveryPersonId);

            List<Map<String, Object>> responseList = new ArrayList<>();

            for (DeliveryPersonShop req : requests) {

                Map<String, Object> reqMap = new HashMap<>();

                reqMap.put("id", req.getId());
                reqMap.put("shopId", req.getShopId());
                reqMap.put("status", req.getStatus().toString());
                reqMap.put("requestedAt", req.getRequestedAt());
                reqMap.put("approvedAt", req.getApprovedAt());

                Optional<GroceryStore> shop =
                        groceryStoreRepository.findById(req.getShopId());

                if (shop.isPresent()) {
                    reqMap.put("shopName", shop.get().getStoreName());
                    reqMap.put("city", shop.get().getCity());
                }

                responseList.add(reqMap);
            }

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Requests fetched successfully!",
                            responseList
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= SEND REQUEST =================

    @PostMapping("/request")
    public ResponseEntity<ApiResponse> sendRequestToJoinShop(
            @RequestParam Long deliveryPersonId,
            @RequestParam Long shopId) {

        try {

            User deliveryPerson = userService.getUserById(deliveryPersonId);

            if (deliveryPerson == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Delivery person not found"));
            }

            DeliveryPersonShop request =
                    deliveryPersonShopService.sendRequest(deliveryPersonId, shopId);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Request sent successfully!",
                            request
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= MY SHOPS =================

    @GetMapping("/my-shops/{deliveryPersonId}")
    public ResponseEntity<ApiResponse> getMyShops(
            @PathVariable Long deliveryPersonId) {

        try {

            List<DeliveryPersonShop> assignments =
                    deliveryPersonShopService
                            .getApprovedShopsByDeliveryPerson(deliveryPersonId);

            List<Map<String, Object>> responseList = new ArrayList<>();

            if (assignments != null) {

                for (DeliveryPersonShop assignment : assignments) {

                    Map<String, Object> shopData = new HashMap<>();

                    shopData.put("id", assignment.getId());
                    shopData.put("shopId", assignment.getShopId());
                    shopData.put("status", assignment.getStatus().toString());
                    shopData.put("approvedAt", assignment.getApprovedAt());

                    Optional<GroceryStore> shop =
                            groceryStoreRepository.findById(assignment.getShopId());

                    if (shop.isPresent()) {

                        shopData.put("storeName", shop.get().getStoreName());
                        shopData.put("city", shop.get().getCity());
                        shopData.put("address", shop.get().getAddress());
                        shopData.put("imageUrl", shop.get().getImageUrl());
                    }

                    responseList.add(shopData);
                }
            }

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Approved shops fetched successfully!",
                            responseList
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= GET ALL DELIVERY PERSONS =================

    @GetMapping("/persons")
    public ResponseEntity<ApiResponse> getAllDeliveryPersons() {

        try {

            List<User> deliveryPersons =
                    userService.getUsersByRole(User.Role.DELIVERY);

            List<Map<String, Object>> responseList = new ArrayList<>();

            for (User dp : deliveryPersons) {

                Map<String, Object> dpMap = new LinkedHashMap<>();

                dpMap.put("id", dp.getId());
                dpMap.put("name", dp.getName());
                dpMap.put("email", dp.getEmail());
                dpMap.put("phone", dp.getPhone());

                responseList.add(dpMap);
            }

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Delivery persons fetched successfully!",
                            responseList
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= GET DELIVERY PERSON BY ID =================

    @GetMapping("/persons/{id}")
    public ResponseEntity<ApiResponse> getDeliveryPersonById(
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

            if (!currentUserId.equals(id)) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(
                                "You can only view your own profile"
                        ));
            }

            User deliveryPerson = userService.getUserById(id);

            if (deliveryPerson == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(
                                "Delivery person not found"
                        ));
            }

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Delivery person found!",
                            deliveryPerson
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= APPROVED PERSONS BY SHOP =================

    @GetMapping("/shop/{shopId}/approved-persons")
    public ResponseEntity<ApiResponse> getApprovedDeliveryPersonsByShop(
            @PathVariable Long shopId) {

        try {

            List<DeliveryPersonShop> approvedRelations =
                    deliveryPersonShopService.getApprovedByShop(shopId);

            List<Map<String, Object>> approvedPersons = new ArrayList<>();

            for (DeliveryPersonShop rel : approvedRelations) {

                User dp = userService.getUserById(rel.getDeliveryPersonId());

                if (dp != null) {

                    Map<String, Object> dpMap = new LinkedHashMap<>();

                    dpMap.put("id", dp.getId());
                    dpMap.put("name", dp.getName());
                    dpMap.put("email", dp.getEmail());
                    dpMap.put("phone", dp.getPhone());
                    dpMap.put("approvedAt", rel.getApprovedAt());

                    approvedPersons.add(dpMap);
                }
            }

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Approved delivery persons fetched successfully!",
                            approvedPersons
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= APPROVE REQUEST =================

    @PutMapping("/requests/{requestId}/approve")
    public ResponseEntity<ApiResponse> approveRequest(
            @PathVariable Long requestId) {

        try {

            DeliveryPersonShop approved =
                    deliveryPersonShopService.approveRequest(requestId);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Request approved successfully!",
                            approved
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= REJECT REQUEST =================

    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<ApiResponse> rejectRequest(
            @PathVariable Long requestId) {

        try {

            DeliveryPersonShop rejected =
                    deliveryPersonShopService.rejectRequest(requestId);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Request rejected!",
                            rejected
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= SHOP REQUEST DETAILS =================

    @GetMapping("/requests/shop/{shopId}/details")
    public ResponseEntity<ApiResponse> getRequestsByShopWithDetails(
            @PathVariable Long shopId) {

        try {

            List<DeliveryShopRequestDTO> requests =
                    deliveryPersonShopService
                            .getRequestsByShopWithDetails(shopId);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Requests fetched successfully!",
                            requests
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= CHECK APPROVED =================

    @GetMapping("/check/{deliveryPersonId}/{shopId}")
    public ResponseEntity<ApiResponse> isApproved(
            @PathVariable Long deliveryPersonId,
            @PathVariable Long shopId) {

        try {

            boolean isApproved =
                    deliveryPersonShopService
                            .isApproved(deliveryPersonId, shopId);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Status fetched",
                            isApproved
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= UPDATE STATUS =================

    @PutMapping("/persons/{id}/status")
    public ResponseEntity<ApiResponse> updateDeliveryPersonStatus(
            @PathVariable Long id,
            @RequestParam User.DeliveryStatus status) {

        try {

            User deliveryPerson = userService.getUserById(id);

            if (deliveryPerson == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(
                                "Delivery person not found"
                        ));
            }

            deliveryPerson.setDeliveryStatus(status);

            userService.updateUser(deliveryPerson);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Delivery person status updated!",
                            deliveryPerson
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ================= TOKEN =================

    private Long getUserIdFromToken(String authHeader) {

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            return null;
        }

        try {

            String token = authHeader.substring(7);

            return jwtUtil.extractUserId(token);

        } catch (Exception e) {

            return null;
        }
    }
}