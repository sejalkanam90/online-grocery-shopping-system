package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.dto.DeliveryRatingRequest;
import com.grocery.onlinegrocery.entity.DeliveryRating;
import com.grocery.onlinegrocery.entity.Order;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.DeliveryRatingRepository;
import com.grocery.onlinegrocery.repository.OrderRepository;
import com.grocery.onlinegrocery.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryRatingService {

    @Autowired
    private DeliveryRatingRepository deliveryRatingRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    // ADD RATING
    @Transactional
    public ApiResponse addDeliveryRating(DeliveryRatingRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != Order.OrderStatus.DELIVERED) {
            return ApiResponse.error("Order not delivered yet");
        }

        if (deliveryRatingRepository.findByOrderId(request.getOrderId()).isPresent()) {
            return ApiResponse.error("Already rated");
        }

        User deliveryPerson = userRepository.findById(request.getDeliveryPersonId())
                .orElseThrow(() -> new RuntimeException("Delivery person not found"));

        DeliveryRating rating = new DeliveryRating();
        rating.setOrderId(request.getOrderId());
        rating.setDeliveryPersonId(request.getDeliveryPersonId());
        rating.setUserId(request.getUserId());
        rating.setRating(request.getRating());
        rating.setComment(request.getComment());

        deliveryRatingRepository.save(rating);

        order.setDeliveryRating(request.getRating());
        order.setDeliveryComment(request.getComment());
        orderRepository.save(order);

        return ApiResponse.success("Rating added successfully", rating);
    }

    // CHECK RATING
    public ApiResponse checkOrderRating(Long orderId) {

        Optional<DeliveryRating> rating = deliveryRatingRepository.findByOrderId(orderId);

        return ApiResponse.success("OK", new Object() {
            public boolean rated = rating.isPresent();
            public int ratingValue = rating.map(DeliveryRating::getRating).orElse(0);
        });
    }

    // GET BY ORDER
    public ApiResponse getRatingByOrder(Long orderId) {

        return deliveryRatingRepository.findByOrderId(orderId)
                .map(r -> ApiResponse.success("Found", r))
                .orElse(ApiResponse.error("Not found"));
    }

    // BY DELIVERY PERSON
    public ApiResponse getRatingsByDeliveryPerson(Long deliveryPersonId) {

        List<DeliveryRating> list = deliveryRatingRepository.findByDeliveryPersonId(deliveryPersonId);
        return ApiResponse.success("OK", list);
    }

    // AVERAGE
    public ApiResponse getAverageRatingForDeliveryPerson(Long deliveryPersonId) {

        List<DeliveryRating> list = deliveryRatingRepository.findByDeliveryPersonId(deliveryPersonId);

        double avg = list.stream()
                .mapToInt(DeliveryRating::getRating)
                .average()
                .orElse(0.0);

        return ApiResponse.success("OK", new Object() {
            public double averageRating = avg;
            public int totalRatings = list.size();
        });
    }

    // USER RATINGS
    public ApiResponse getRatingsByUser(Long userId) {

        return ApiResponse.success(
                "OK",
                deliveryRatingRepository.findByUserId(userId)
        );
    }

    // DELETE
    @Transactional
    public ApiResponse deleteRating(Long ratingId) {

        if (!deliveryRatingRepository.existsById(ratingId)) {
            return ApiResponse.error("Not found");
        }

        deliveryRatingRepository.deleteById(ratingId);
        return ApiResponse.success("Deleted", null);
    }
}