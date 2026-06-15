// 📁 com.grocery.onlinegrocery.entity.Location.java

package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "locations")
public class Location {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private boolean active = true;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}