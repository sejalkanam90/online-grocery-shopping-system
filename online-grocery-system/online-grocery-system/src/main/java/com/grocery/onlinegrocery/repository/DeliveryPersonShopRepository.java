package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.DeliveryPersonShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPersonShopRepository extends JpaRepository<DeliveryPersonShop, Long> {
    
    // ===============================
    // FIND BY DELIVERY PERSON ID
    // ===============================
    List<DeliveryPersonShop> findByDeliveryPersonId(Long deliveryPersonId);
    
    // ===============================
    // FIND BY SHOP ID
    // ===============================
    List<DeliveryPersonShop> findByShopId(Long shopId);
    
    // ===============================
    // FIND BY DELIVERY PERSON ID AND SHOP ID (Check if request exists)
    // ===============================
    Optional<DeliveryPersonShop> findByDeliveryPersonIdAndShopId(Long deliveryPersonId, Long shopId);
    
    // ===============================
    // FIND BY SHOP ID AND STATUS (Get requests for shop by status)
    // ===============================
    List<DeliveryPersonShop> findByShopIdAndStatus(Long shopId, DeliveryPersonShop.Status status);
    
    // ===============================
    // FIND BY DELIVERY PERSON ID AND STATUS (Get requests by delivery person by status)
    // ===============================
    List<DeliveryPersonShop> findByDeliveryPersonIdAndStatus(Long deliveryPersonId, DeliveryPersonShop.Status status);
    
    // ===============================
    // FIND BY DELIVERY PERSON ID, SHOP ID AND STATUS (Check specific status)
    // ===============================
    Optional<DeliveryPersonShop> findByDeliveryPersonIdAndShopIdAndStatus(
            Long deliveryPersonId, Long shopId, DeliveryPersonShop.Status status);
}