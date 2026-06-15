package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Order;
import com.grocery.onlinegrocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // USER ORDERS
    List<Order> findByUser(User user);
    
    // ✅ USER ORDERS WITH DELIVERY PERSON (नवीन)
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.deliveryPerson WHERE o.user.id = :userId")
    List<Order> findByUserIdWithDeliveryPerson(@Param("userId") Long userId);

    // DELIVERY PERSON ORDERS
    List<Order> findByDeliveryPerson(User deliveryPerson);
    
    // ✅ DELIVERY PERSON ORDERS WITH DETAILS (नवीन)
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user WHERE o.deliveryPerson.id = :deliveryPersonId")
    List<Order> findByDeliveryPersonIdWithUser(@Param("deliveryPersonId") Long deliveryPersonId);

    // ORDER STATUS
    List<Order> findByOrderStatus(Order.OrderStatus status);

    // ORDER NUMBER
    Optional<Order> findByOrderNumber(String orderNumber);

    // STORE ORDERS
    @Query("SELECT o FROM Order o WHERE o.store.id = :storeId")
    List<Order> findByStoreId(@Param("storeId") Long storeId);
    
    // ✅ GET ORDER WITH DELIVERY RATING (नवीन)
    @Query("SELECT o.id, o.orderNumber, o.orderStatus, o.deliveredAt, o.deliveryRating, o.deliveryComment, dp.id as deliveryPersonId, dp.name as deliveryPersonName FROM Order o LEFT JOIN o.deliveryPerson dp WHERE o.deliveryPerson.id = :deliveryPersonId AND o.orderStatus = 'DELIVERED'")
    List<Object[]> findCompletedOrdersWithRating(@Param("deliveryPersonId") Long deliveryPersonId);
}