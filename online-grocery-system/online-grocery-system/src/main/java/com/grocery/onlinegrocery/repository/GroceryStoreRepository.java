// 📁 com.grocery.onlinegrocery.repository.GroceryStoreRepository.java (UPDATED)

package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.GroceryStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroceryStoreRepository extends JpaRepository<GroceryStore, Long> {
    
    // Find by User ID
    Optional<GroceryStore> findByUserId(Long userId);
    
    // Find by Business Email
    Optional<GroceryStore> findByEmail(String email);
    
    // ✅ ADD THIS - Find by Store Name (exact match)
    Optional<GroceryStore> findByStoreName(String storeName);
    
    // Find by Approval Status
    List<GroceryStore> findByApprovalStatus(GroceryStore.ApprovalStatus status);
    
    // Find by City
    List<GroceryStore> findByCity(String city);
    
    // Find open shops
    List<GroceryStore> findByIsOpenTrue();
    
    // Search by Store Name (contains - case insensitive)
    List<GroceryStore> findByStoreNameContainingIgnoreCase(String name);
    
    // Count by approval status
    long countByApprovalStatus(GroceryStore.ApprovalStatus status);
}