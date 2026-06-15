// 📁 com.grocery.onlinegrocery.controller.LocationController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.entity.Location;
import com.grocery.onlinegrocery.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {
    
    @Autowired
    private LocationService locationService;
    
    @PostMapping
    public ApiResponse addLocation(@RequestBody Location location) {
        try {
            Location newLocation = locationService.addLocation(location);
            return ApiResponse.success("Location added successfully", newLocation);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping
    public ApiResponse getAllLocations() {
        try {
            List<Location> locations = locationService.getAllLocations();
            return ApiResponse.success("Locations fetched successfully", locations);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/active")
    public ApiResponse getActiveLocations() {
        try {
            List<Location> locations = locationService.getActiveLocations();
            return ApiResponse.success("Active locations fetched", locations);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ApiResponse getLocationById(@PathVariable Long id) {
        try {
            Location location = locationService.getLocationById(id);
            return ApiResponse.success("Location found", location);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/city/{city}")
    public ApiResponse getLocationsByCity(@PathVariable String city) {
        try {
            List<Location> locations = locationService.getLocationsByCity(city);
            return ApiResponse.success("Locations found in " + city, locations);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse updateLocation(@PathVariable Long id, @RequestBody Location location) {
        try {
            Location updatedLocation = locationService.updateLocation(id, location);
            return ApiResponse.success("Location updated successfully", updatedLocation);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse deleteLocation(@PathVariable Long id) {
        try {
            locationService.deleteLocation(id);
            return ApiResponse.success("Location deleted successfully");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PatchMapping("/{id}/toggle")
    public ApiResponse toggleActive(@PathVariable Long id) {
        try {
            Location location = locationService.toggleActive(id);
            return ApiResponse.success("Location status toggled", location);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/search")
    public ApiResponse searchLocations(@RequestParam String keyword) {
        try {
            List<Location> locations = locationService.searchLocations(keyword);
            return ApiResponse.success("Search results", locations);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}