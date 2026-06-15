// 📁 com.grocery.onlinegrocery.resource.ReviewResource.java

package com.grocery.onlinegrocery.resource;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.ReviewRequest;
import com.grocery.onlinegrocery.dto.ReviewResponse;
import com.grocery.onlinegrocery.entity.Review;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.service.ReviewService;
import com.grocery.onlinegrocery.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReviewResource {

    private static final Logger LOG = LoggerFactory.getLogger(ReviewResource.class);

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    /**
     * Add review for a product
     */
    public ResponseEntity<ApiResponse> addReview(ReviewRequest request) {
        LOG.info("Request received for add review - userId: {}, productId: {}", 
                 request.getUserId(), request.getProductId());

        try {
            // Validate user
            User user = userService.getUserById(request.getUserId());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            // Validate rating
            if (request.getRating() < 1 || request.getRating() > 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Rating must be between 1 and 5"));
            }

            // Check if already reviewed
            if (reviewService.hasUserReviewed(request.getUserId(), request.getProductId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("You have already reviewed this product"));
            }

            // Add review
            Review review = reviewService.addReview(
                request.getUserId(),
                request.getProductId(),
                request.getOrderId(),
                request.getRating(),
                request.getComment()
            );

            return ResponseEntity.ok(ApiResponse.success("Review added successfully!", review));

        } catch (Exception e) {
            LOG.error("Error adding review: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to add review: " + e.getMessage()));
        }
    }

    /**
     * Get reviews by product
     */
    public ResponseEntity<ApiResponse> getReviewsByProduct(Long productId) {
        LOG.info("Request received for get reviews by product: {}", productId);

        try {
            List<ReviewResponse> reviews = reviewService.getReviewsByProduct(productId);
            return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully!", reviews));

        } catch (Exception e) {
            LOG.error("Error fetching reviews: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch reviews: " + e.getMessage()));
        }
    }

    /**
     * Get reviews by user
     */
    public ResponseEntity<ApiResponse> getReviewsByUser(Long userId) {
        LOG.info("Request received for get reviews by user: {}", userId);

        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            List<ReviewResponse> reviews = reviewService.getReviewsByUser(userId);
            return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully!", reviews));

        } catch (Exception e) {
            LOG.error("Error fetching reviews: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch reviews: " + e.getMessage()));
        }
    }

    /**
     * Get average rating for a product
     */
    public ResponseEntity<ApiResponse> getAverageRating(Long productId) {
        LOG.info("Request received for get average rating by product: {}", productId);

        try {
            Double avgRating = reviewService.getAverageRating(productId);
            Long totalReviews = reviewService.getTotalReviewsCount(productId);
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("averageRating", avgRating != null ? avgRating : 0.0);
            response.put("totalReviews", totalReviews);
            response.put("productId", productId);
            
            return ResponseEntity.ok(ApiResponse.success("Rating fetched!", response));

        } catch (Exception e) {
            LOG.error("Error fetching rating: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch rating: " + e.getMessage()));
        }
    }

    /**
     * Update review
     */
    public ResponseEntity<ApiResponse> updateReview(Long reviewId, ReviewRequest request) {
        LOG.info("Request received for update review: {}", reviewId);

        try {
            // Check if review exists
            Review review = reviewService.getReviewById(reviewId);
            if (review == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Review not found"));
            }

            // Check if user owns this review
            if (!review.getUserId().equals(request.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You can only update your own reviews"));
            }

            // Update review
            Review updatedReview = reviewService.updateReview(
                reviewId,
                request.getRating(),
                request.getComment()
            );

            return ResponseEntity.ok(ApiResponse.success("Review updated successfully!", updatedReview));

        } catch (Exception e) {
            LOG.error("Error updating review: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update review: " + e.getMessage()));
        }
    }

    /**
     * Delete review
     */
    public ResponseEntity<ApiResponse> deleteReview(Long reviewId, Long userId) {
        LOG.info("Request received for delete review: {}, userId: {}", reviewId, userId);

        try {
            // Check if review exists
            Review review = reviewService.getReviewById(reviewId);
            if (review == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Review not found"));
            }

            // Check if user owns this review
            if (!review.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You can only delete your own reviews"));
            }

            // Delete review
            reviewService.deleteReview(reviewId, userId);

            return ResponseEntity.ok(ApiResponse.success("Review deleted successfully!"));

        } catch (Exception e) {
            LOG.error("Error deleting review: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete review: " + e.getMessage()));
        }
    }

    /**
     * Check if user has already reviewed a product
     */
    public ResponseEntity<ApiResponse> hasUserReviewed(Long userId, Long productId) {
        LOG.info("Request received for check user reviewed - userId: {}, productId: {}", userId, productId);

        try {
            boolean hasReviewed = reviewService.hasUserReviewed(userId, productId);
            Review review = reviewService.getUserReview(userId, productId);
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("hasReviewed", hasReviewed);
            response.put("review", review);
            response.put("userId", userId);
            response.put("productId", productId);
            
            return ResponseEntity.ok(ApiResponse.success("Check completed!", response));

        } catch (Exception e) {
            LOG.error("Error checking review: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check review: " + e.getMessage()));
        }
    }
}