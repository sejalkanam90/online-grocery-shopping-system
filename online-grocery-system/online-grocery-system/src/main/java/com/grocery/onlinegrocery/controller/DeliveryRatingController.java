package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.DeliveryRatingRequest;
import com.grocery.onlinegrocery.service.DeliveryRatingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery-rating")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class DeliveryRatingController {

    @Autowired
    private DeliveryRatingService deliveryRatingService;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addRating(
            @RequestBody DeliveryRatingRequest request) {

        return ResponseEntity.ok(
                deliveryRatingService.addDeliveryRating(request)
        );
    }

    @GetMapping("/check/{orderId}")
    public ResponseEntity<ApiResponse> checkRating(@PathVariable Long orderId) {
        return ResponseEntity.ok(deliveryRatingService.checkOrderRating(orderId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse> getRatingByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(deliveryRatingService.getRatingByOrder(orderId));
    }

    @GetMapping("/delivery-person/{deliveryPersonId}")
    public ResponseEntity<ApiResponse> getByDeliveryPerson(@PathVariable Long deliveryPersonId) {
        return ResponseEntity.ok(deliveryRatingService.getRatingsByDeliveryPerson(deliveryPersonId));
    }

    @GetMapping("/average/{deliveryPersonId}")
    public ResponseEntity<ApiResponse> getAverage(@PathVariable Long deliveryPersonId) {
        return ResponseEntity.ok(deliveryRatingService.getAverageRatingForDeliveryPerson(deliveryPersonId));
    }

    @DeleteMapping("/delete/{ratingId}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long ratingId) {
        return ResponseEntity.ok(deliveryRatingService.deleteRating(ratingId));
    }
}