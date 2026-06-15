package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.ShopWallet;
import com.grocery.onlinegrocery.entity.ShopWalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShopWalletTransactionRepository extends JpaRepository<ShopWalletTransaction, Long> {
    
    List<ShopWalletTransaction> findByShopWalletOrderByCreatedAtDesc(ShopWallet shopWallet);
}