// 📁 com.grocery.onlinegrocery.service.LocationService.java

package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.entity.Location;
import com.grocery.onlinegrocery.repository.LocationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LocationService {

    private static final Logger LOG = LoggerFactory.getLogger(LocationService.class);

    @Autowired
    private LocationRepository locationRepository;

    /**
     * Add new location
     */
    @Transactional
    public Location addLocation(Location location) {
        LOG.info("Adding new location: {}", location.getName());
        
        location.setActive(true);
        location.setCreatedAt(LocalDateTime.now());
        location.setUpdatedAt(LocalDateTime.now());
        
        return locationRepository.save(location);
    }

    /**
     * Get all locations
     */
    public List<Location> getAllLocations() {
        LOG.info("Getting all locations");
        return locationRepository.findAll();
    }

    /**
     * Get active locations only
     */
    public List<Location> getActiveLocations() {
        LOG.info("Getting active locations");
        return locationRepository.findByActiveTrue();
    }

    /**
     * Get location by ID
     */
    public Location getLocationById(Long id) {
        LOG.info("Getting location by id: {}", id);
        return locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with id: " + id));
    }

    /**
     * Get locations by city
     */
    public List<Location> getLocationsByCity(String city) {
        LOG.info("Getting locations by city: {}", city);
        return locationRepository.findByCity(city);
    }

    /**
     * Get locations by city and active
     */
    public List<Location> getActiveLocationsByCity(String city) {
        LOG.info("Getting active locations by city: {}", city);
        return locationRepository.findByCityAndActiveTrue(city);
    }

    /**
     * Update location
     */
    @Transactional
    public Location updateLocation(Long id, Location updatedLocation) {
        LOG.info("Updating location: {}", id);
        
        Location location = getLocationById(id);
        
        location.setName(updatedLocation.getName());
        location.setCity(updatedLocation.getCity());
        location.setState(updatedLocation.getState());
        location.setPincode(updatedLocation.getPincode());
        location.setLatitude(updatedLocation.getLatitude());
        location.setLongitude(updatedLocation.getLongitude());
        location.setUpdatedAt(LocalDateTime.now());
        
        return locationRepository.save(location);
    }

    /**
     * Delete location
     */
    @Transactional
    public void deleteLocation(Long id) {
        LOG.info("Deleting location: {}", id);
        
        if (!locationRepository.existsById(id)) {
            throw new RuntimeException("Location not found with id: " + id);
        }
        locationRepository.deleteById(id);
        LOG.info("Location deleted successfully");
    }

    /**
     * Toggle location active status
     */
    @Transactional
    public Location toggleActive(Long id) {
        LOG.info("Toggling location status: {}", id);
        
        Location location = getLocationById(id);
        location.setActive(!location.isActive());
        location.setUpdatedAt(LocalDateTime.now());
        
        return locationRepository.save(location);
    }

    /**
     * Search locations by keyword (name or city)
     */
    public List<Location> searchLocations(String keyword) {
        LOG.info("Searching locations by keyword: {}", keyword);
        return locationRepository.findByNameContainingIgnoreCaseOrCityContainingIgnoreCase(keyword, keyword);
    }

    /**
     * Check if location exists
     */
    public boolean locationExists(Long id) {
        return locationRepository.existsById(id);
    }
}