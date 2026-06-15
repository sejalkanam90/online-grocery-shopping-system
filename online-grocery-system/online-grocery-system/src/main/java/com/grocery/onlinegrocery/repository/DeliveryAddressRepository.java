// 📁 com.grocery.onlinegrocery.repository.DeliveryAddressRepository.java

package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.DeliveryAddress;
import com.grocery.onlinegrocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddress, Long> {
    
    List<DeliveryAddress> findByUser(User user);
    
    List<DeliveryAddress> findByUserId(Long userId);
    
    DeliveryAddress findByUserIdAndIsDefaultTrue(Long userId);
    
    boolean existsByUserIdAndIsDefaultTrue(Long userId);
}