package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.ReviewResponse;
import com.grocery.onlinegrocery.entity.Product;
import com.grocery.onlinegrocery.entity.Review;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.ProductRepository;
import com.grocery.onlinegrocery.repository.ReviewRepository;
import com.grocery.onlinegrocery.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private static final Logger LOG = LoggerFactory.getLogger(ReviewService.class);

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // ✅ Get review by ID
    public Review getReviewById(Long reviewId) {
        LOG.info("Getting review by id: {}", reviewId);
        return reviewRepository.findById(reviewId).orElse(null);
    }

    // ✅ Add Review
    @Transactional
    public Review addReview(Long userId, Long productId, Long orderId, Integer rating, String comment) {
        LOG.info("Adding review - userId: {}, productId: {}, rating: {}", userId, productId, rating);

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        // Fetch product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already reviewed
        if (reviewRepository.existsByUserIdAndProduct(userId, product)) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Review review = new Review();
        review.setUserId(userId);
        review.setProduct(product);
        review.setOrderId(orderId);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    // ✅ Get Reviews by Product
    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        LOG.info("Getting reviews by product: {}", productId);

        List<Review> reviews = reviewRepository.findByProductId(productId);

        return reviews.stream().map(review -> {
            ReviewResponse response = new ReviewResponse();
            response.setId(review.getId());
            response.setUserId(review.getUserId());
            response.setProductId(review.getProduct().getId());
            response.setOrderId(review.getOrderId());
            response.setRating(review.getRating());
            response.setComment(review.getComment());
            response.setCreatedAt(review.getCreatedAt());
            response.setUpdatedAt(review.getUpdatedAt());

            // Get user name
            User user = userRepository.findById(review.getUserId()).orElse(null);
            if (user != null) {
                response.setUserName(user.getName());
            }

            // Get product name
            response.setProductName(review.getProduct().getName());

            return response;
        }).collect(Collectors.toList());
    }

    // ✅ Get Reviews by User
    public List<ReviewResponse> getReviewsByUser(Long userId) {
        LOG.info("Getting reviews by user: {}", userId);

        List<Review> reviews = reviewRepository.findByUserId(userId);

        return reviews.stream().map(review -> {
            ReviewResponse response = new ReviewResponse();
            response.setId(review.getId());
            response.setUserId(review.getUserId());
            response.setProductId(review.getProduct().getId());
            response.setOrderId(review.getOrderId());
            response.setRating(review.getRating());
            response.setComment(review.getComment());
            response.setCreatedAt(review.getCreatedAt());
            response.setUpdatedAt(review.getUpdatedAt());

            response.setProductName(review.getProduct().getName());

            return response;
        }).collect(Collectors.toList());
    }

    // ✅ Average rating
    public Double getAverageRating(Long productId) {
        LOG.info("Getting average rating for product: {}", productId);
        return reviewRepository.getAverageRatingByProductId(productId);
    }

    // ✅ Total reviews count
    public Long getTotalReviewsCount(Long productId) {
        LOG.info("Getting total reviews count for product: {}", productId);
        return reviewRepository.getTotalReviewsCountByProductId(productId);
    }

    // ✅ Update review
    @Transactional
    public Review updateReview(Long reviewId, Integer rating, String comment) {
        LOG.info("Updating review: {}", reviewId);

        Review review = getReviewById(reviewId);
        if (review == null) {
            throw new RuntimeException("Review not found with id: " + reviewId);
        }

        if (rating != null && rating >= 1 && rating <= 5) {
            review.setRating(rating);
        }
        if (comment != null && !comment.isEmpty()) {
            review.setComment(comment);
        }
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    // ✅ Delete review
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        LOG.info("Deleting review: {}, userId: {}", reviewId, userId);

        Review review = getReviewById(reviewId);
        if (review == null) {
            throw new RuntimeException("Review not found with id: " + reviewId);
        }

        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        reviewRepository.deleteById(reviewId);
    }

    // ✅ Check if user has reviewed
    public boolean hasUserReviewed(Long userId, Long productId) {
        LOG.info("Checking if user {} has reviewed product {}", userId, productId);
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return false;
        }
        return reviewRepository.existsByUserIdAndProduct(userId, product);
    }

    // ✅ Get user's review for a product
    public Review getUserReview(Long userId, Long productId) {
        LOG.info("Getting user review for userId: {}, productId: {}", userId, productId);
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return null;
        }
        return reviewRepository.findByUserIdAndProduct(userId, product);
    }

    // ✅ Get reviews by rating
    public List<Review> getReviewsByProductAndRating(Long productId, Integer rating) {
        LOG.info("Getting reviews for product {} with rating {}", productId, rating);
        return reviewRepository.findByProductIdAndRating(productId, rating);
    }

    // ✅ Get latest reviews
    public List<Review> getLatestReviews() {
        LOG.info("Getting latest 5 reviews");
        return reviewRepository.findTop5ByOrderByCreatedAtDesc();
    }

    // ✅ Get reviews by order
    public List<Review> getReviewsByOrder(Long orderId) {
        LOG.info("Getting reviews by order: {}", orderId);
        return reviewRepository.findByOrderId(orderId);
    }

    // ✅ Count reviews by product
    public long countReviewsByProduct(Long productId) {
        LOG.info("Counting reviews for product: {}", productId);
        return reviewRepository.countByProductId(productId);
    }

    // ✅ Delete all reviews of a product
    @Transactional
    public void deleteReviewsByProduct(Long productId) {
        LOG.info("Deleting all reviews for product: {}", productId);
        reviewRepository.deleteByProductId(productId);
    }

    // ✅ Delete all reviews of a user
    @Transactional
    public void deleteReviewsByUser(Long userId) {
        LOG.info("Deleting all reviews for user: {}", userId);
        reviewRepository.deleteByUserId(userId);
    }
}