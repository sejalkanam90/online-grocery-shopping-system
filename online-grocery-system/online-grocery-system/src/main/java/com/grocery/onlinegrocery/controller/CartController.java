package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.CartRequest;
import com.grocery.onlinegrocery.dto.CartResponse;
import com.grocery.onlinegrocery.entity.Cart;
import com.grocery.onlinegrocery.entity.Product;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.service.CartService;
import com.grocery.onlinegrocery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:8085"})
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    // ==================== ADD TO CART ====================
    @PostMapping("/add")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse addToCart(@RequestBody CartRequest request) {
        try {
            System.out.println("🛒 Adding to cart - User: " + request.getUserId() + ", Product: " + request.getProductId());
            
            User user = userService.getUserById(request.getUserId());
            if (user == null) {
                return ApiResponse.error("User not found");
            }

            cartService.addToCart(user, request.getProductId(), request.getQuantity());
            return ApiResponse.success("Product added to cart successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    // ==================== GET CART BY USER ====================
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ApiResponse getCart(@PathVariable Long userId) {
        try {
            System.out.println("🛒 Fetching cart for user: " + userId);
            
            User user = userService.getUserById(userId);
            if (user == null) {
                return ApiResponse.error("User not found");
            }

            List<Cart> cartItems = cartService.getCartByUser(user);
            List<CartResponse> responseList = new ArrayList<>();

            for (Cart item : cartItems) {
                Product product = item.getProduct();

                CartResponse dto = new CartResponse();
                dto.setId(item.getId());
                dto.setProductId(product.getId());
                dto.setProductName(product.getName());
                dto.setPrice(product.getPrice().doubleValue());
                dto.setQuantity(item.getQuantity());
                dto.setTotal(product.getPrice().doubleValue() * item.getQuantity());
                dto.setImage1(product.getImage1());
                dto.setImage2(product.getImage2());
                dto.setImage3(product.getImage3());

                if (product.getCategory() != null) {
                    dto.setCategoryName(product.getCategory().getName());
                } else {
                    dto.setCategoryName("—");
                }

                if (product.getGroceryShop() != null) {
                    dto.setShopName(product.getGroceryShop().getStoreName());
                } else {
                    dto.setShopName("—");
                }

                responseList.add(dto);
            }

            System.out.println("🛒 Found " + responseList.size() + " items in cart");
            return ApiResponse.success("Cart fetched successfully", responseList);

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(e.getMessage());
        }
    }

    // ==================== UPDATE CART ITEM QUANTITY ====================
    @PutMapping("/item/{cartId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse updateCartQuantity(@PathVariable Long cartId, @RequestParam Integer quantity) {
        try {
            Cart updatedCart = cartService.updateQuantity(cartId, quantity);
            return ApiResponse.success("Cart updated successfully", updatedCart);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // ==================== DELETE CART ITEM ====================
    @DeleteMapping("/item/{cartId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse deleteItem(@PathVariable Long cartId) {
        try {
            cartService.deleteCartItem(cartId);
            return ApiResponse.success("Item removed successfully", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    // ==================== CLEAR CART ====================
    @DeleteMapping("/{userId}/clear")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse clearCart(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            cartService.clearCart(user);
            return ApiResponse.success("Cart cleared successfully", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}