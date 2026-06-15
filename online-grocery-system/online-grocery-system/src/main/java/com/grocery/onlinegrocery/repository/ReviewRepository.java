package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Product;
import com.grocery.onlinegrocery.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // ✅ Find by user id
    List<Review> findByUserId(Long userId);
    
    // ✅ Find by product (using Product object)
    List<Review> findByProduct(Product product);
    
    // ✅ Find by product id (using @Query)
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId")
    List<Review> findByProductId(@Param("productId") Long productId);
    
    // ✅ Find by product id and rating
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.rating = :rating")
    List<Review> findByProductIdAndRating(@Param("productId") Long productId, @Param("rating") Integer rating);
    
    // ✅ Check exists by user id and product
    boolean existsByUserIdAndProduct(Long userId, Product product);
    
    // ✅ Find by user id and product
    Review findByUserIdAndProduct(Long userId, Product product);
    
    // ✅ Find by order id
    List<Review> findByOrderId(Long orderId);
    
    // ✅ Get average rating by product id
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);
    
    // ✅ Get total reviews count by product id
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    Long getTotalReviewsCountByProductId(@Param("productId") Long productId);
    
    // ✅ Count by product id
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);
    
    // ✅ Delete by product id
    @Query("DELETE FROM Review r WHERE r.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
    
    // ✅ Delete by user id
    void deleteByUserId(Long userId);
    
    // ✅ Top 5 latest reviews
    List<Review> findTop5ByOrderByCreatedAtDesc();
}