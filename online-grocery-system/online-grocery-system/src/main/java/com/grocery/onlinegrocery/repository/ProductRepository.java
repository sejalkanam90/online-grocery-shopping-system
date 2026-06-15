// 📁 com.grocery.onlinegrocery.repository.ProductRepository.java (FIXED)

package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ✅ ALL products with category and shop (LEFT JOIN)
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.groceryShop")
    List<Product> findAllWithCategoryAndShop();

    // ✅ Products by shop with category - FIXED with @Param
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.groceryShop.id = :shopId")
    List<Product> findByGroceryShopIdWithCategory(@Param("shopId") Long groceryShopId);

    // ✅ Products by category
    List<Product> findByCategoryId(Long categoryId);

    // ✅ Products by shop (without join)
    List<Product> findByGroceryShopId(Long groceryShopId);

    // ✅ Search by name
    List<Product> findByNameContainingIgnoreCase(String name);

    // ✅ Products by status
    List<Product> findByStatus(String status);

    // ✅ Products by price range
    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // ✅ Count by category
    long countByCategoryId(Long categoryId);

    // ✅ Count by shop
    long countByGroceryShopId(Long groceryShopId);
}