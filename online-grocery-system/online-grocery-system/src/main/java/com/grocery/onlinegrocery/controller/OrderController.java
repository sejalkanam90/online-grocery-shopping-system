// 📁 com.grocery.onlinegrocery.controller.OrderController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.OrderRequest;
import com.grocery.onlinegrocery.entity.Address;
import com.grocery.onlinegrocery.entity.Order;
import com.grocery.onlinegrocery.entity.OrderItem;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.service.OrderService;
import com.grocery.onlinegrocery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:8085"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm:ss a");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ===============================
    // CREATE ORDER AFTER RAZORPAY PAYMENT
    // ===============================
    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createOrderAfterPayment(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("📝 ORDER CREATE REQUEST: " + request);
            
            if (request.get("addressId") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Missing required field: addressId"));
            }
            if (request.get("totalAmount") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Missing required field: totalAmount"));
            }
            if (request.get("razorpayPaymentId") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Missing required field: razorpayPaymentId"));
            }
            if (request.get("razorpayOrderId") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Missing required field: razorpayOrderId"));
            }
            
            if (!request.containsKey("userId")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Missing required field: userId"));
            }
            
            Long addressId;
            Double totalAmount;
            Long userId;
            
            try {
                addressId = Long.valueOf(String.valueOf(request.get("addressId")));
                totalAmount = Double.valueOf(String.valueOf(request.get("totalAmount")));
                userId = Long.valueOf(String.valueOf(request.get("userId")));
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid number format in request fields"));
            }
            
            String razorpayPaymentId = String.valueOf(request.get("razorpayPaymentId"));
            String razorpayOrderId = String.valueOf(request.get("razorpayOrderId"));
            
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found with id: " + userId));
            }
            
            Order order = orderService.createOrderFromCart(user, addressId, totalAmount, razorpayPaymentId, razorpayOrderId);
            
            return ResponseEntity.ok(ApiResponse.success("Order created successfully!", order));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create order: " + e.getMessage()));
        }
    }

    // ===============================
    // GET ALL ORDERS (ADMIN)
    // ===============================
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(ApiResponse.success("All orders fetched successfully!", orders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // GET ORDERS BY USER (CUSTOMER)
    // ===============================
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getOrdersByUser(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }
            List<Order> orders = orderService.getOrdersByUser(user);
            
            // ✅ Add delivery rating to response
            List<Map<String, Object>> responseList = new ArrayList<>();
            for (Order order : orders) {
                Map<String, Object> orderMap = new LinkedHashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("orderNumber", order.getOrderNumber());
                orderMap.put("orderStatus", order.getOrderStatus());
                orderMap.put("createdAt", order.getCreatedAt());
                orderMap.put("deliveredAt", order.getDeliveredAt());
                orderMap.put("deliveryRating", order.getDeliveryRating());
                orderMap.put("deliveryComment", order.getDeliveryComment());
                
                if (order.getDeliveryPerson() != null) {
                    Map<String, Object> deliveryPersonMap = new HashMap<>();
                    deliveryPersonMap.put("id", order.getDeliveryPerson().getId());
                    deliveryPersonMap.put("name", order.getDeliveryPerson().getName());
                    deliveryPersonMap.put("phone", order.getDeliveryPerson().getPhone());
                    orderMap.put("deliveryPerson", deliveryPersonMap);
                }
                
                if (order.getStore() != null) {
                    Map<String, Object> storeMap = new HashMap<>();
                    storeMap.put("id", order.getStore().getId());
                    storeMap.put("storeName", order.getStore().getStoreName());
                    orderMap.put("store", storeMap);
                }
                
                if (order.getItems() != null && !order.getItems().isEmpty()) {
                    List<Map<String, Object>> itemsList = new ArrayList<>();
                    for (OrderItem item : order.getItems()) {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("id", item.getId());
                        itemMap.put("productName", item.getProductName());
                        itemMap.put("quantity", item.getQuantity());
                        itemMap.put("price", item.getPrice());
                        
                        if (item.getProduct() != null) {
                            Map<String, Object> productMap = new HashMap<>();
                            productMap.put("id", item.getProduct().getId());
                            productMap.put("name", item.getProduct().getName());
                            productMap.put("image1", item.getProduct().getImage1());
                            productMap.put("image2", item.getProduct().getImage2());
                            productMap.put("image3", item.getProduct().getImage3());
                            productMap.put("price", item.getProduct().getPrice());
                            
                            if (item.getProduct().getCategory() != null) {
                                Map<String, Object> categoryMap = new HashMap<>();
                                categoryMap.put("id", item.getProduct().getCategory().getId());
                                categoryMap.put("name", item.getProduct().getCategory().getName());
                                productMap.put("category", categoryMap);
                            }
                            itemMap.put("product", productMap);
                        }
                        itemsList.add(itemMap);
                    }
                    orderMap.put("items", itemsList);
                }
                
                responseList.add(orderMap);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully!", responseList));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // GET ORDERS BY STORE
    // ===============================
    @GetMapping("/store/{storeId}")
    public ResponseEntity<Map<String, Object>> getOrdersByStore(@PathVariable Long storeId) {
        try {
            List<Order> orders = orderService.getOrdersByStore(storeId);
            
            List<Map<String, Object>> orderList = new ArrayList<>();
            
            for (Order order : orders) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("orderNumber", order.getOrderNumber());
                orderMap.put("finalAmount", order.getFinalAmount());
                orderMap.put("orderStatus", order.getOrderStatus());
                orderMap.put("createdAt", order.getCreatedAt());
                orderMap.put("deliveredAt", order.getDeliveredAt());
                orderMap.put("deliveryRating", order.getDeliveryRating());
                orderMap.put("deliveryComment", order.getDeliveryComment());
                orderMap.put("customerName", order.getUser() != null ? order.getUser().getName() : "—");
                
                if (order.getDeliveryPerson() != null) {
                    orderMap.put("deliveryPersonName", order.getDeliveryPerson().getName());
                    orderMap.put("deliveryPersonPhone", order.getDeliveryPerson().getPhone());
                } else {
                    orderMap.put("deliveryPersonName", "Pending");
                    orderMap.put("deliveryPersonPhone", "—");
                }
                
                if (order.getItems() != null && !order.getItems().isEmpty()) {
                    OrderItem item = order.getItems().get(0);
                    orderMap.put("productName", item.getProductName() != null ? item.getProductName() : "—");
                    orderMap.put("quantity", item.getQuantity() != null ? item.getQuantity() : 1);
                    orderMap.put("price", item.getPrice() != null ? item.getPrice() : 0);
                    
                    if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                        orderMap.put("categoryName", item.getProduct().getCategory().getName());
                    } else {
                        orderMap.put("categoryName", "—");
                    }
                } else {
                    orderMap.put("productName", "—");
                    orderMap.put("quantity", 1);
                    orderMap.put("price", 0);
                    orderMap.put("categoryName", "—");
                }
                
                orderList.add(orderMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orderList);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ===============================
    // GET ORDERS BY DELIVERY PERSON (WITH RATINGS)
    // ===============================
    @GetMapping("/delivery/{deliveryPersonId}")
    public ResponseEntity<ApiResponse> getOrdersByDeliveryPerson(@PathVariable Long deliveryPersonId) {
        try {
            User deliveryPerson = userService.getUserById(deliveryPersonId);
            if (deliveryPerson == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Delivery person not found"));
            }
            List<Order> orders = orderService.getOrdersByDeliveryPerson(deliveryPerson);
            
            List<Map<String, Object>> responseList = new ArrayList<>();
            
            for (Order order : orders) {
                Map<String, Object> orderMap = new LinkedHashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("orderNumber", order.getOrderNumber());
                orderMap.put("finalAmount", order.getFinalAmount());
                orderMap.put("orderStatus", order.getOrderStatus());
                orderMap.put("createdAt", order.getCreatedAt());
                orderMap.put("deliveredAt", order.getDeliveredAt());
                orderMap.put("customerName", order.getUser() != null ? order.getUser().getName() : "—");
                
                // ✅ DELIVERY RATING AND COMMENT - येथे add केले आहे
                orderMap.put("deliveryRating", order.getDeliveryRating());
                orderMap.put("deliveryComment", order.getDeliveryComment());
                
                // Customer address
                String customerAddress = null;
                if (order.getAddress() != null) {
                    Address addr = order.getAddress();
                    StringBuilder fullAddress = new StringBuilder();
                    if (addr.getAddressLine1() != null && !addr.getAddressLine1().isEmpty()) {
                        fullAddress.append(addr.getAddressLine1());
                    }
                    if (addr.getCity() != null && !addr.getCity().isEmpty()) {
                        if (fullAddress.length() > 0) fullAddress.append(", ");
                        fullAddress.append(addr.getCity());
                    }
                    if (addr.getState() != null && !addr.getState().isEmpty()) {
                        if (fullAddress.length() > 0) fullAddress.append(", ");
                        fullAddress.append(addr.getState());
                    }
                    if (addr.getPincode() != null && !addr.getPincode().isEmpty()) {
                        if (fullAddress.length() > 0) fullAddress.append(", ");
                        fullAddress.append(addr.getPincode());
                    }
                    customerAddress = fullAddress.toString();
                }
                
                if ((customerAddress == null || customerAddress.isEmpty()) && order.getUser() != null) {
                    User customer = order.getUser();
                    StringBuilder fullAddress = new StringBuilder();
                    if (customer.getAddress() != null && !customer.getAddress().isEmpty()) {
                        fullAddress.append(customer.getAddress());
                    }
                    if (customer.getCity() != null && !customer.getCity().isEmpty()) {
                        if (fullAddress.length() > 0) fullAddress.append(", ");
                        fullAddress.append(customer.getCity());
                    }
                    if (customer.getState() != null && !customer.getState().isEmpty()) {
                        if (fullAddress.length() > 0) fullAddress.append(", ");
                        fullAddress.append(customer.getState());
                    }
                    if (customer.getPincode() != null && !customer.getPincode().isEmpty()) {
                        if (fullAddress.length() > 0) fullAddress.append(", ");
                        fullAddress.append(customer.getPincode());
                    }
                    customerAddress = fullAddress.toString();
                }
                
                if (customerAddress == null || customerAddress.isEmpty()) {
                    customerAddress = "Address not available";
                }
                orderMap.put("address", customerAddress);
                
                if (order.getStore() != null) {
                    orderMap.put("storeName", order.getStore().getStoreName());
                }
                
                if (order.getDeliveryPerson() != null) {
                    orderMap.put("deliveryPersonName", order.getDeliveryPerson().getName());
                    orderMap.put("deliveryPersonPhone", order.getDeliveryPerson().getPhone());
                }
                
                if (order.getItems() != null && !order.getItems().isEmpty()) {
                    List<Map<String, Object>> itemsList = new ArrayList<>();
                    for (OrderItem item : order.getItems()) {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("productName", item.getProductName());
                        itemMap.put("quantity", item.getQuantity());
                        itemMap.put("price", item.getPrice());
                        
                        if (item.getProduct() != null) {
                            Map<String, Object> productMap = new HashMap<>();
                            productMap.put("id", item.getProduct().getId());
                            productMap.put("name", item.getProduct().getName());
                            productMap.put("image1", item.getProduct().getImage1());
                            productMap.put("image2", item.getProduct().getImage2());
                            productMap.put("image3", item.getProduct().getImage3());
                            
                            if (item.getProduct().getCategory() != null) {
                                Map<String, Object> categoryMap = new HashMap<>();
                                categoryMap.put("id", item.getProduct().getCategory().getId());
                                categoryMap.put("name", item.getProduct().getCategory().getName());
                                productMap.put("category", categoryMap);
                            }
                            itemMap.put("product", productMap);
                            
                            if (item.getProduct().getImage1() != null && !item.getProduct().getImage1().isEmpty()) {
                                itemMap.put("productImage", "http://localhost:8085/uploads/" + item.getProduct().getImage1());
                            }
                        }
                        itemsList.add(itemMap);
                    }
                    orderMap.put("items", itemsList);
                    
                    OrderItem firstItem = order.getItems().get(0);
                    orderMap.put("productName", firstItem.getProductName());
                    orderMap.put("quantity", firstItem.getQuantity());
                    orderMap.put("price", firstItem.getPrice());
                    
                    if (firstItem.getProduct() != null && firstItem.getProduct().getImage1() != null && !firstItem.getProduct().getImage1().isEmpty()) {
                        orderMap.put("productImage", "http://localhost:8085/uploads/" + firstItem.getProduct().getImage1());
                    }
                    
                    if (firstItem.getProduct() != null && firstItem.getProduct().getCategory() != null) {
                        orderMap.put("category", firstItem.getProduct().getCategory().getName());
                    }
                }
                
                responseList.add(orderMap);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully!", responseList));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // GET ORDER BY ID
    // ===============================
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", order.getId());
            response.put("orderNumber", order.getOrderNumber());
            response.put("orderStatus", order.getOrderStatus());
            response.put("createdAt", order.getCreatedAt());
            response.put("deliveredAt", order.getDeliveredAt());
            response.put("deliveryRating", order.getDeliveryRating());
            response.put("deliveryComment", order.getDeliveryComment());
            
            if (order.getDeliveryPerson() != null) {
                Map<String, Object> deliveryPersonMap = new HashMap<>();
                deliveryPersonMap.put("id", order.getDeliveryPerson().getId());
                deliveryPersonMap.put("name", order.getDeliveryPerson().getName());
                deliveryPersonMap.put("phone", order.getDeliveryPerson().getPhone());
                response.put("deliveryPerson", deliveryPersonMap);
            }
            
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                List<Map<String, Object>> itemsList = new ArrayList<>();
                for (OrderItem item : order.getItems()) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("productName", item.getProductName());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("price", item.getPrice());
                    itemsList.add(itemMap);
                }
                response.put("items", itemsList);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Order found!", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // UPDATE ORDER STATUS
    // ===============================
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(@PathVariable Long orderId, @RequestParam Order.OrderStatus status) {
        try {
            Order order = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(ApiResponse.success("Order status updated!", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // ASSIGN DELIVERY PERSON
    // ===============================
    @PutMapping("/{orderId}/assign-delivery")
    public ResponseEntity<ApiResponse> assignDeliveryPerson(@PathVariable Long orderId, @RequestParam Long deliveryPersonId) {
        try {
            User deliveryPerson = userService.getUserById(deliveryPersonId);
            if (deliveryPerson == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Delivery person not found"));
            }
            Order order = orderService.assignDeliveryPerson(orderId, deliveryPerson);
            return ResponseEntity.ok(ApiResponse.success("Delivery person assigned!", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // CANCEL ORDER
    // ===============================
    @PutMapping("/{orderId}/cancel/{userId}")
    public ResponseEntity<ApiResponse> cancelOrder(@PathVariable Long orderId, @PathVariable Long userId) {
        try {
            Order order = orderService.cancelOrder(orderId, userId);
            return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully!", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // SEARCH ORDER BY ORDER NUMBER
    // ===============================
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchOrderByOrderNumber(@RequestParam String orderNumber) {
        try {
            Order order = orderService.getOrderByOrderNumber(orderNumber);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Order not found with ID: " + orderNumber));
            }
            return ResponseEntity.ok(ApiResponse.success("Order found!", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===============================
    // PLACE NEW ORDER (WITHOUT RAZORPAY - WALLET)
    // ===============================
    @PostMapping("/{userId}/place")
    public ResponseEntity<ApiResponse> placeOrder(@PathVariable Long userId, @RequestBody OrderRequest request) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }
            Order order = orderService.placeOrder(user, request);
            return ResponseEntity.ok(ApiResponse.success("Order placed successfully!", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}