package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Wallet;
import com.grocery.onlinegrocery.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
	List<WalletTransaction> findByWallet(Wallet wallet);

	List<WalletTransaction> findByWalletOrderByCreatedAtDesc(Wallet wallet);

	List<WalletTransaction> findByType(String type);

	List<WalletTransaction> findByStatus(String status);

	List<WalletTransaction> findByWalletAndType(Wallet wallet, String type);
}