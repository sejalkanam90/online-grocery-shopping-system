package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.PgTransaction;
import com.grocery.onlinegrocery.entity.PaymentStatus;
import com.grocery.onlinegrocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PgTransactionRepository extends JpaRepository<PgTransaction, Long> {

    // 👤 By user entity
    List<PgTransaction> findByUser(User user);

    // 👤 By userId
    List<PgTransaction> findByUserId(Long userId);

    // 📦 Razorpay order id
    Optional<PgTransaction> findByRazorpayOrderId(String razorpayOrderId);

    // 💳 FIXED: correct field name
    Optional<PgTransaction> findByRazorpayPaymentId(String razorpayPaymentId);

    // 📊 FIXED: enum type
    List<PgTransaction> findByStatus(PaymentStatus status);

    // 📅 Latest transactions first
    List<PgTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 🔐 Prevent duplicate payments
    boolean existsByRazorpayPaymentId(String razorpayPaymentId);

    // 📦 Find full transaction match
    Optional<PgTransaction> findByRazorpayOrderIdAndRazorpayPaymentId(
            String razorpayOrderId,
            String razorpayPaymentId
    );
}