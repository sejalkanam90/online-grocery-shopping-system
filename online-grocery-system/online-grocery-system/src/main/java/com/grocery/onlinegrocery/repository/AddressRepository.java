// 📁 com.grocery.onlinegrocery.repository.AddressRepository.java

package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Address;
import com.grocery.onlinegrocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {  // ✅ Long ID
    
    List<Address> findByUser(User user);
    
    Optional<Address> findByUserAndIsDefaultTrue(User user);
    
    void deleteByUser(User user);
}