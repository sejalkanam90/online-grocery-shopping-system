package com.grocery.onlinegrocery.resource;

import com.grocery.onlinegrocery.dto.*;
import com.grocery.onlinegrocery.entity.*;
import com.grocery.onlinegrocery.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderResource {

    private static final Logger LOG = LoggerFactory.getLogger(OrderResource.class);

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    // ==================== PLACE ORDER ====================
    public ResponseEntity<CommonApiResponse> placeOrder(Long userId, OrderRequest request) {
        LOG.info("Request received for place order");

        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return new ResponseEntity<>(CommonApiResponse.error("User not found"), HttpStatus.NOT_FOUND);
            }

            Order order = orderService.placeOrder(user, request);
            return ResponseEntity.ok(CommonApiResponse.success("Order placed successfully", order));
        } catch (Exception e) {
            LOG.error("Error placing order: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== GET ORDERS BY USER ====================
    public ResponseEntity<CommonApiResponse> getOrdersByUser(Long userId) {
        LOG.info("Request received for get orders by user: {}", userId);

        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return new ResponseEntity<>(CommonApiResponse.error("User not found"), HttpStatus.NOT_FOUND);
            }

            List<Order> orders = orderService.getOrdersByUser(user);
            
            List<OrderResponse> responseList = orders.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(CommonApiResponse.success("Orders fetched", responseList));
        } catch (Exception e) {
            LOG.error("Error getting orders: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== GET ORDERS BY STORE ====================
    public ResponseEntity<CommonApiResponse> getOrdersByStore(Long storeId) {
        LOG.info("Request received for get orders by store: {}", storeId);

        try {
            List<Order> orders = orderService.getOrdersByStore(storeId);
            return ResponseEntity.ok(CommonApiResponse.success("Orders fetched", orders));
        } catch (Exception e) {
            LOG.error("Error getting orders by store: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== GET ORDER BY ID ====================
    public ResponseEntity<CommonApiResponse> getOrderById(Long orderId) {
        LOG.info("Request received for get order by id: {}", orderId);

        try {
            Order order = orderService.getOrderById(orderId);
            if (order == null) {
                return new ResponseEntity<>(CommonApiResponse.error("Order not found"), HttpStatus.NOT_FOUND);
            }

            return ResponseEntity.ok(CommonApiResponse.success("Order found", order));
        } catch (Exception e) {
            LOG.error("Error getting order: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== UPDATE ORDER STATUS ====================
    public ResponseEntity<CommonApiResponse> updateOrderStatus(Long orderId, Order.OrderStatus status) {
        LOG.info("Request received for update order status: {} to {}", orderId, status);

        try {
            Order order = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(CommonApiResponse.success("Order status updated", order));
        } catch (Exception e) {
            LOG.error("Error updating order status: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== ASSIGN DELIVERY PERSON ====================
    public ResponseEntity<CommonApiResponse> assignDeliveryPerson(Long orderId, Long deliveryPersonId) {
        LOG.info("Request received for assign delivery person: {} to order: {}", deliveryPersonId, orderId);

        try {
            User deliveryPerson = userService.getUserById(deliveryPersonId);
            if (deliveryPerson == null) {
                return new ResponseEntity<>(CommonApiResponse.error("Delivery person not found"), HttpStatus.NOT_FOUND);
            }
            
            Order order = orderService.assignDeliveryPerson(orderId, deliveryPerson);
            return ResponseEntity.ok(CommonApiResponse.success("Delivery person assigned", order));
        } catch (Exception e) {
            LOG.error("Error assigning delivery person: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== CANCEL ORDER ====================
    public ResponseEntity<CommonApiResponse> cancelOrder(Long orderId, Long userId) {
        LOG.info("Request received for cancel order: {} by user: {}", orderId, userId);

        try {
            Order order = orderService.cancelOrder(orderId, userId);
            return ResponseEntity.ok(CommonApiResponse.success("Order cancelled successfully", order));
        } catch (Exception e) {
            LOG.error("Error cancelling order: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== CONVERT TO DTO WITH PRODUCTS ====================
    private OrderResponse convertToDto(Order order) {
        OrderResponse dto = OrderResponse.fromOrder(order);
        
        // ✅ Add products (items) to DTO
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderProductDetail> products = order.getItems().stream()
                .map(item -> {
                    OrderProductDetail productDetail = new OrderProductDetail();
                    productDetail.setId(item.getId());
                    productDetail.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
                    productDetail.setProductName(item.getProductName());
                    productDetail.setQuantity(item.getQuantity());
                    productDetail.setPrice(item.getPrice());
                    productDetail.setTotal(item.getTotal());
                    
                    // Product images
                    if (item.getProduct() != null) {
                        productDetail.setImage1(item.getProduct().getImage1());
                        productDetail.setImage2(item.getProduct().getImage2());
                        productDetail.setImage3(item.getProduct().getImage3());
                        productDetail.setUnit(item.getProduct().getUnit());
                        
                        // Category name
                        if (item.getProduct().getCategory() != null) {
                            productDetail.setCategoryName(item.getProduct().getCategory().getName());
                        }
                    }
                    
                    return productDetail;
                })
                .collect(Collectors.toList());
            
            dto.setProducts(products);
        }
        
        return dto;
    }
}