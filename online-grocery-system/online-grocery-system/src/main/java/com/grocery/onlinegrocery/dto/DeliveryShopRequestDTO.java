// 📁 com.grocery.onlinegrocery.dto.DeliveryShopRequestDTO.java

package com.grocery.onlinegrocery.dto;

import java.time.LocalDateTime;

public class DeliveryShopRequestDTO {

	private Long id;
	private Long deliveryPersonId;
	private String deliveryPersonName;
	private String deliveryPersonEmail;
	private String deliveryPersonPhone;
	private Long shopId;
	private String shopName;
	private String status;
	private LocalDateTime requestedAt;
	private LocalDateTime approvedAt;
	private LocalDateTime createdAt;

	public DeliveryShopRequestDTO() {
	}

	// Getters
	public Long getId() {
		return id;
	}

	public Long getDeliveryPersonId() {
		return deliveryPersonId;
	}

	public String getDeliveryPersonName() {
		return deliveryPersonName;
	}

	public String getDeliveryPersonEmail() {
		return deliveryPersonEmail;
	}

	public String getDeliveryPersonPhone() {
		return deliveryPersonPhone;
	}

	public Long getShopId() {
		return shopId;
	}

	public String getShopName() {
		return shopName;
	}

	public String getStatus() {
		return status;
	}

	public LocalDateTime getRequestedAt() {
		return requestedAt;
	}

	public LocalDateTime getApprovedAt() {
		return approvedAt;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	// Setters
	public void setId(Long id) {
		this.id = id;
	}

	public void setDeliveryPersonId(Long deliveryPersonId) {
		this.deliveryPersonId = deliveryPersonId;
	}

	public void setDeliveryPersonName(String deliveryPersonName) {
		this.deliveryPersonName = deliveryPersonName;
	}

	public void setDeliveryPersonEmail(String deliveryPersonEmail) {
		this.deliveryPersonEmail = deliveryPersonEmail;
	}

	public void setDeliveryPersonPhone(String deliveryPersonPhone) {
		this.deliveryPersonPhone = deliveryPersonPhone;
	}

	public void setShopId(Long shopId) {
		this.shopId = shopId;
	}

	public void setShopName(String shopName) {
		this.shopName = shopName;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public void setRequestedAt(LocalDateTime requestedAt) {
		this.requestedAt = requestedAt;
	}

	public void setApprovedAt(LocalDateTime approvedAt) {
		this.approvedAt = approvedAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}