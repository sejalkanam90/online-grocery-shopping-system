// 📁 com.grocery.onlinegrocery.repository.UserRepository.java

package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Basic find methods
    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhone(String phone);
    
    // Check existence
    boolean existsByEmail(String email);
    
    boolean existsByPhone(String phone);
    
    boolean existsByEmailAndRole(String email, User.Role role);
    
    // Find by role
    List<User> findByRole(User.Role role);
    
    // Find by active status
    List<User> findByActive(boolean active);
    
    // Find delivery persons by status - ✅ Add this method
    List<User> findByRoleAndDeliveryStatus(User.Role role, User.DeliveryStatus deliveryStatus);
    
    // Find by name containing (search)
    List<User> findByNameContainingIgnoreCase(String name);
    
    // Count by role
    Long countByRole(User.Role role);
    
    // Find by email and role
    Optional<User> findByEmailAndRole(String email, User.Role role);
    
    // Find all active users
    List<User> findByActiveTrue();
    
    // Find users by city
    List<User> findByCity(String city);
    
    // Find delivery persons by vehicle type
    List<User> findByRoleAndVehicleType(User.Role role, String vehicleType);
}