package com.grocery.onlinegrocery.resource;

import com.grocery.onlinegrocery.dto.CartResponse;
import com.grocery.onlinegrocery.entity.Cart;
import com.grocery.onlinegrocery.entity.Product;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.service.CartService;
import com.grocery.onlinegrocery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CartResource {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    // ✅ GET CART BY USER
    public ResponseEntity<?> getCartByUser(Long userId) {

        // ✅ Fix: Pass Long directly
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<Cart> cartList = cartService.getCartByUser(user);
        List<CartResponse> responseList = new ArrayList<>();

        for (Cart cart : cartList) {
            Product product = cart.getProduct();

            CartResponse dto = new CartResponse();
            dto.setId(cart.getId());
            dto.setProductId((long) product.getId());
            dto.setProductName(product.getName());
            dto.setPrice(product.getPrice().doubleValue());
            dto.setQuantity(cart.getQuantity());
            dto.setTotal(product.getPrice().doubleValue() * cart.getQuantity());

            // Images
            dto.setImage1(product.getImage1());
            dto.setImage2(product.getImage2());
            dto.setImage3(product.getImage3());

            // Category Name
            if (product.getCategory() != null) {
                dto.setCategoryName(product.getCategory().getName());
            }

            // Shop Name
            if (product.getGroceryShop() != null) {
                dto.setShopName(product.getGroceryShop().getStoreName());
            }

            responseList.add(dto);
        }

        return ResponseEntity.ok().body(
            java.util.Map.of(
                "success", true,
                "data", responseList
            )
        );
    }
}