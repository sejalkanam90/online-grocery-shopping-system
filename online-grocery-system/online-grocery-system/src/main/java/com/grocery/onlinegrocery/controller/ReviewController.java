// 📁 com.grocery.onlinegrocery.controller.ReviewController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.ReviewRequest;
import com.grocery.onlinegrocery.resource.ReviewResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ReviewController {

    @Autowired
    private ReviewResource reviewResource;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addReview(@RequestBody ReviewRequest request) {
        return reviewResource.addReview(request);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse> getReviewsByProduct(@PathVariable Long productId) {
        return reviewResource.getReviewsByProduct(productId);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getReviewsByUser(@PathVariable Long userId) {
        return reviewResource.getReviewsByUser(userId);
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<ApiResponse> getAverageRating(@PathVariable Long productId) {
        return reviewResource.getAverageRating(productId);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse> updateReview(@PathVariable Long reviewId, @RequestBody ReviewRequest request) {
        return reviewResource.updateReview(reviewId, request);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long reviewId, @RequestParam Long userId) {
        return reviewResource.deleteReview(reviewId, userId);
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse> hasUserReviewed(@RequestParam Long userId, @RequestParam Long productId) {
        return reviewResource.hasUserReviewed(userId, productId);
    }
}