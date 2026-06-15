// 📁 com.grocery.onlinegrocery.repository.CartRepository.java

package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Cart;
import com.grocery.onlinegrocery.entity.Product;
import com.grocery.onlinegrocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    // Find all cart items by user
    List<Cart> findByUser(User user);
    
    // Find cart item by user and product
    Cart findByUserAndProduct(User user, Product product);
    
    // Delete all cart items by user
    void deleteByUser(User user);
    
    // Count cart items by user
    long countByUser(User user);
}