// 📁 com.grocery.onlinegrocery.repository.WalletRepository.java

package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    
    // Find wallet by user id
    Optional<Wallet> findByUserId(Long userId);
    
    // Check if wallet exists for user
    boolean existsByUserId(Long userId);
}