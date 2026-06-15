// 📁 com.grocery.onlinegrocery.service.DeliveryPersonShopService.java

package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.DeliveryShopRequestDTO;
import com.grocery.onlinegrocery.entity.DeliveryPersonShop;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.DeliveryPersonShopRepository;
import com.grocery.onlinegrocery.repository.GroceryStoreRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryPersonShopService {

    @Autowired
    private DeliveryPersonShopRepository deliveryPersonShopRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GroceryStoreRepository groceryStoreRepository;

    // ✅ Get all requests by delivery person
    public List<DeliveryPersonShop> getByDeliveryPersonId(
            Long deliveryPersonId) {

        return deliveryPersonShopRepository
                .findByDeliveryPersonId(deliveryPersonId);
    }

    // ✅ Get requests by delivery person
    public List<DeliveryPersonShop> getRequestsByDeliveryPerson(
            Long deliveryPersonId) {

        return deliveryPersonShopRepository
                .findByDeliveryPersonId(deliveryPersonId);
    }

    // ✅ Send request to shop
    @Transactional
    public DeliveryPersonShop sendRequest(
            Long deliveryPersonId,
            Long shopId) {

        Optional<DeliveryPersonShop> existing =
                deliveryPersonShopRepository
                        .findByDeliveryPersonIdAndShopId(
                                deliveryPersonId,
                                shopId);

        if (existing.isPresent()) {
            throw new RuntimeException(
                    "Request already sent");
        }

        DeliveryPersonShop request =
                new DeliveryPersonShop();

        request.setDeliveryPersonId(deliveryPersonId);
        request.setShopId(shopId);

        request.setStatus(
                DeliveryPersonShop.Status.PENDING);

        request.setRequestedAt(LocalDateTime.now());
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        return deliveryPersonShopRepository.save(request);
    }

    // ✅ Get requests by shop
    public List<DeliveryPersonShop> getRequestsByShop(
            Long shopId) {

        return deliveryPersonShopRepository
                .findByShopId(shopId);
    }

    // ✅ Get pending requests
    public List<DeliveryPersonShop> getPendingRequestsByShop(
            Long shopId) {

        return deliveryPersonShopRepository
                .findByShopIdAndStatus(
                        shopId,
                        DeliveryPersonShop.Status.PENDING);
    }

    // ✅ Get approved delivery persons
    public List<DeliveryPersonShop> getApprovedByShop(
            Long shopId) {

        return deliveryPersonShopRepository
                .findByShopIdAndStatus(
                        shopId,
                        DeliveryPersonShop.Status.APPROVED);
    }

    // ✅ Get approved shops by delivery person
    public List<DeliveryPersonShop>
    getApprovedShopsByDeliveryPerson(
            Long deliveryPersonId) {

        System.out.println(
                "🔵 Getting approved shops for delivery person: "
                        + deliveryPersonId);

        List<DeliveryPersonShop> approved =
                deliveryPersonShopRepository
                        .findByDeliveryPersonIdAndStatus(
                                deliveryPersonId,
                                DeliveryPersonShop.Status.APPROVED);

        System.out.println(
                "🔵 Found: "
                        + (approved != null
                        ? approved.size()
                        : 0)
                        + " approved shops");

        return approved != null
                ? approved
                : new ArrayList<>();
    }

    // ✅ Approve request
    @Transactional
    public DeliveryPersonShop approveRequest(
            Long requestId) {

        DeliveryPersonShop request =
                deliveryPersonShopRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"));

        request.setStatus(
                DeliveryPersonShop.Status.APPROVED);

        request.setApprovedAt(LocalDateTime.now());

        request.setUpdatedAt(LocalDateTime.now());

        return deliveryPersonShopRepository.save(request);
    }

    // ✅ Reject request
    @Transactional
    public DeliveryPersonShop rejectRequest(
            Long requestId) {

        DeliveryPersonShop request =
                deliveryPersonShopRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"));

        request.setStatus(
                DeliveryPersonShop.Status.REJECTED);

        request.setUpdatedAt(LocalDateTime.now());

        return deliveryPersonShopRepository.save(request);
    }

    // ✅ Check approved relation
    public boolean isApproved(
            Long deliveryPersonId,
            Long shopId) {

        Optional<DeliveryPersonShop> relation =
                deliveryPersonShopRepository
                        .findByDeliveryPersonIdAndShopIdAndStatus(
                                deliveryPersonId,
                                shopId,
                                DeliveryPersonShop.Status.APPROVED);

        return relation.isPresent();
    }

    // ✅ Get requests with full details
    public List<DeliveryShopRequestDTO>
    getRequestsByShopWithDetails(Long shopId) {

        List<DeliveryPersonShop> requests =
                deliveryPersonShopRepository
                        .findByShopId(shopId);

        List<DeliveryShopRequestDTO> result =
                new ArrayList<>();

        for (DeliveryPersonShop request : requests) {

            User deliveryPerson = null;
            GroceryStore shop = null;

            try {

                deliveryPerson =
                        userService.getUserById(
                                request.getDeliveryPersonId());

            } catch (Exception e) {

                System.err.println(
                        "Failed to fetch delivery person: "
                                + e.getMessage());
            }

            try {

                shop =
                        groceryStoreRepository
                                .findById(shopId)
                                .orElse(null);

            } catch (Exception e) {

                System.err.println(
                        "Failed to fetch shop: "
                                + e.getMessage());
            }

            DeliveryShopRequestDTO dto =
                    new DeliveryShopRequestDTO();

            dto.setId(request.getId());

            dto.setDeliveryPersonId(
                    request.getDeliveryPersonId());

            dto.setShopId(request.getShopId());

            dto.setStatus(
                    request.getStatus() != null
                            ? request.getStatus().toString()
                            : null);

            dto.setRequestedAt(
                    request.getRequestedAt());

            dto.setApprovedAt(
                    request.getApprovedAt());

            dto.setCreatedAt(
                    request.getCreatedAt());

            if (deliveryPerson != null) {

                dto.setDeliveryPersonName(
                        deliveryPerson.getName());

                dto.setDeliveryPersonEmail(
                        deliveryPerson.getEmail());

                dto.setDeliveryPersonPhone(
                        deliveryPerson.getPhone());
            }

            if (shop != null) {

                dto.setShopName(
                        shop.getStoreName());
            }

            result.add(dto);
        }

        return result;
    }

    // ✅ Get request by id with details
    public DeliveryShopRequestDTO
    getRequestByIdWithDetails(Long requestId) {

        DeliveryPersonShop request =
                deliveryPersonShopRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"));

        User deliveryPerson =
                userService.getUserById(
                        request.getDeliveryPersonId());

        GroceryStore shop =
                groceryStoreRepository
                        .findById(request.getShopId())
                        .orElse(null);

        DeliveryShopRequestDTO dto =
                new DeliveryShopRequestDTO();

        dto.setId(request.getId());

        dto.setDeliveryPersonId(
                request.getDeliveryPersonId());

        dto.setShopId(
                request.getShopId());

        dto.setStatus(
                request.getStatus() != null
                        ? request.getStatus().toString()
                        : null);

        dto.setRequestedAt(
                request.getRequestedAt());

        dto.setApprovedAt(
                request.getApprovedAt());

        dto.setCreatedAt(
                request.getCreatedAt());

        if (deliveryPerson != null) {

            dto.setDeliveryPersonName(
                    deliveryPerson.getName());

            dto.setDeliveryPersonEmail(
                    deliveryPerson.getEmail());

            dto.setDeliveryPersonPhone(
                    deliveryPerson.getPhone());
        }

        if (shop != null) {

            dto.setShopName(
                    shop.getStoreName());
        }

        return dto;
    }
}