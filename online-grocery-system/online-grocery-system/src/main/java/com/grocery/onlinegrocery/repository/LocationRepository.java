// 📁 com.grocery.onlinegrocery.repository.LocationRepository.java

package com.grocery.onlinegrocery.repository;

import com.grocery.onlinegrocery.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    
    // Find by city
    List<Location> findByCity(String city);
    
    // Find by active status
    List<Location> findByActiveTrue();
    
    // Find by city and active
    List<Location> findByCityAndActiveTrue(String city);
    
    // Search by name or city containing keyword
    List<Location> findByNameContainingIgnoreCaseOrCityContainingIgnoreCase(String name, String city);
    
    // Find by name containing
    List<Location> findByNameContainingIgnoreCase(String name);
}