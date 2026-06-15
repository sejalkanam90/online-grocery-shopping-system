package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.entity.Cart;
import com.grocery.onlinegrocery.entity.Product;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.CartRepository;
import com.grocery.onlinegrocery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public void addToCart(User user, Long productId, Integer quantity) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart existing = cartRepository.findByUserAndProduct(user, product);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            existing.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(existing);
            return;
        }

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setProduct(product);
        cart.setQuantity(quantity);
        cart.setAddedAt(LocalDateTime.now());
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);
    }

    public List<Cart> getCartByUser(User user) {
        return cartRepository.findByUser(user);
    }

    @Transactional
    public Cart updateQuantity(Long cartId, Integer quantity) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cartRepository.delete(cart);
            return null;
        }

        cart.setQuantity(quantity);
        cart.setUpdatedAt(LocalDateTime.now());

        return cartRepository.save(cart);
    }

    @Transactional
    public void deleteCartItem(Long cartId) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cartRepository.delete(cart);
    }

    @Transactional
    public void clearCart(User user) {
        cartRepository.deleteByUser(user);
    }

    public long getCartCountByUser(User user) {
        return cartRepository.countByUser(user);
    }

    public double getCartTotal(User user) {
        List<Cart> items = cartRepository.findByUser(user);
        return items.stream()
                .mapToDouble(i -> i.getProduct().getPrice().doubleValue() * i.getQuantity())
                .sum();
    }
}