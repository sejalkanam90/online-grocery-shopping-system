package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.entity.ShopWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ShopWalletRepository extends JpaRepository<ShopWallet, Long> {
    
    Optional<ShopWallet> findByShop(GroceryStore shop);
    
    // ✅ FIXED: This method should work
    @Query("SELECT w FROM ShopWallet w WHERE w.shop.id = :shopId")
    Optional<ShopWallet> findByShopId(@Param("shopId") Long shopId);
}