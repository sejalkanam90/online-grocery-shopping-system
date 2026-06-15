package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.DeliveryRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryRatingRepository extends JpaRepository<DeliveryRating, Long> {

    Optional<DeliveryRating> findByOrderId(Long orderId);

    List<DeliveryRating> findByDeliveryPersonId(Long deliveryPersonId);

    List<DeliveryRating> findByUserId(Long userId);
}