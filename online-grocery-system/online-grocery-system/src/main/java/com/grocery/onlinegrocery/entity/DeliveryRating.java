package com.grocery.onlinegrocery.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_ratings")
public class DeliveryRating {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "order_id", nullable = false)
	private Long orderId;

	@Column(name = "delivery_person_id", nullable = false)
	private Long deliveryPersonId;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(nullable = false)
	private Integer rating;

	@Column(length = 500)
	private String comment;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@PrePersist
	public void prePersist() {
		this.createdAt = LocalDateTime.now();
	}

	// Getters & Setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getOrderId() {
		return orderId;
	}

	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}

	public Long getDeliveryPersonId() {
		return deliveryPersonId;
	}

	public void setDeliveryPersonId(Long deliveryPersonId) {
		this.deliveryPersonId = deliveryPersonId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Integer getRating() {
		return rating;
	}

	public void setRating(Integer rating) {
		this.rating = rating;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}