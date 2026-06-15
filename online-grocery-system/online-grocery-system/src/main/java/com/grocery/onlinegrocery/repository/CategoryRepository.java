package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find categories by grocery shop id
    List<Category> findByGroceryShop_Id(Long groceryShopId);
    
    // Find by name
    List<Category> findByNameContainingIgnoreCase(String name);
    
    // Find active categories
    List<Category> findByActiveTrue();
}