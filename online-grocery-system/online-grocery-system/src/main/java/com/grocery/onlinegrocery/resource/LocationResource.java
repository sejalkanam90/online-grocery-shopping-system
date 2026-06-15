// 📁 com.grocery.onlinegrocery.resource.LocationResource.java

package com.grocery.onlinegrocery.resource;

import com.grocery.onlinegrocery.dto.CommonApiResponse;
import com.grocery.onlinegrocery.entity.Location;
import com.grocery.onlinegrocery.service.LocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class LocationResource {

    private static final Logger LOG = LoggerFactory.getLogger(LocationResource.class);

    @Autowired
    private LocationService locationService;

    /**
     * Add Location
     */
    public ResponseEntity<CommonApiResponse> addLocation(Location location) {
        LOG.info("Request received for add location");

        try {
            // Validation
            if (location.getName() == null || location.getName().isEmpty()) {
                return new ResponseEntity<>(CommonApiResponse.error("Location name is required"), HttpStatus.BAD_REQUEST);
            }
            if (location.getCity() == null || location.getCity().isEmpty()) {
                return new ResponseEntity<>(CommonApiResponse.error("City name is required"), HttpStatus.BAD_REQUEST);
            }

            Location savedLocation = locationService.addLocation(location);
            return ResponseEntity.ok(CommonApiResponse.success("Location added successfully", savedLocation));

        } catch (Exception e) {
            LOG.error("Error adding location: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get All Locations
     */
    public ResponseEntity<CommonApiResponse> getAllLocations() {
        LOG.info("Request received for get all locations");

        try {
            List<Location> locations = locationService.getAllLocations();
            return ResponseEntity.ok(CommonApiResponse.success("Locations fetched successfully", locations));
        } catch (Exception e) {
            LOG.error("Error fetching locations: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error("Failed to fetch locations"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get Active Locations
     */
    public ResponseEntity<CommonApiResponse> getActiveLocations() {
        LOG.info("Request received for get active locations");

        try {
            List<Location> locations = locationService.getActiveLocations();
            return ResponseEntity.ok(CommonApiResponse.success("Active locations fetched successfully", locations));
        } catch (Exception e) {
            LOG.error("Error fetching active locations: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error("Failed to fetch active locations"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get Location by ID
     */
    public ResponseEntity<CommonApiResponse> getLocationById(Long id) {
        LOG.info("Request received for get location by id: {}", id);

        try {
            Location location = locationService.getLocationById(id);
            return ResponseEntity.ok(CommonApiResponse.success("Location found", location));
        } catch (Exception e) {
            LOG.error("Error fetching location: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get Locations by City
     */
    public ResponseEntity<CommonApiResponse> getLocationsByCity(String city) {
        LOG.info("Request received for get locations by city: {}", city);

        try {
            List<Location> locations = locationService.getLocationsByCity(city);
            return ResponseEntity.ok(CommonApiResponse.success("Locations found in " + city, locations));
        } catch (Exception e) {
            LOG.error("Error fetching locations by city: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error("Failed to fetch locations"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update Location
     */
    public ResponseEntity<CommonApiResponse> updateLocation(Long id, Location location) {
        LOG.info("Request received for update location: {}", id);

        try {
            Location updatedLocation = locationService.updateLocation(id, location);
            return ResponseEntity.ok(CommonApiResponse.success("Location updated successfully", updatedLocation));
        } catch (Exception e) {
            LOG.error("Error updating location: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Delete Location
     */
    public ResponseEntity<CommonApiResponse> deleteLocation(Long id) {
        LOG.info("Request received for delete location: {}", id);

        try {
            locationService.deleteLocation(id);
            return ResponseEntity.ok(CommonApiResponse.success("Location deleted successfully"));
        } catch (Exception e) {
            LOG.error("Error deleting location: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Toggle Location Active Status
     */
    public ResponseEntity<CommonApiResponse> toggleActive(Long id) {
        LOG.info("Request received for toggle location status: {}", id);

        try {
            Location location = locationService.toggleActive(id);
            String status = location.isActive() ? "activated" : "deactivated";
            return ResponseEntity.ok(CommonApiResponse.success("Location " + status + " successfully", location));
        } catch (Exception e) {
            LOG.error("Error toggling location status: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Search Locations
     */
    public ResponseEntity<CommonApiResponse> searchLocations(String keyword) {
        LOG.info("Request received for search locations by keyword: {}", keyword);

        try {
            if (keyword == null || keyword.isEmpty()) {
                return getAllLocations();
            }
            List<Location> locations = locationService.searchLocations(keyword);
            return ResponseEntity.ok(CommonApiResponse.success("Search results", locations));
        } catch (Exception e) {
            LOG.error("Error searching locations: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}