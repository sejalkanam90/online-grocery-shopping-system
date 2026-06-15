// 📁 com.grocery.onlinegrocery.resource.GroceryStoreResource.java

package com.grocery.onlinegrocery.resource;

import com.grocery.onlinegrocery.dto.CommonApiResponse;
import com.grocery.onlinegrocery.dto.ShopRegisterRequest;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.service.GroceryStoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class GroceryStoreResource {

    private static final Logger LOG = LoggerFactory.getLogger(GroceryStoreResource.class);

    @Autowired
    private GroceryStoreService groceryStoreService;

    /**
     * Register Shop
     */
    public ResponseEntity<CommonApiResponse> registerShop(ShopRegisterRequest request) {
        LOG.info("Request received for register shop");

        try {
            GroceryStore store = groceryStoreService.registerShop(request);
            return ResponseEntity.ok(CommonApiResponse.success("Shop registered successfully", store));
        } catch (Exception e) {
            LOG.error("Error registering shop: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get All Approved Shops (Public)
     */
    public ResponseEntity<CommonApiResponse> getApprovedShops() {
        LOG.info("Request received for get approved shops");

        try {
            List<GroceryStore> shops = groceryStoreService.getApprovedShops();
            return ResponseEntity.ok(CommonApiResponse.success("Shops fetched successfully", shops));
        } catch (Exception e) {
            LOG.error("Error fetching approved shops: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("Failed to fetch shops"));
        }
    }

    /**
     * Get Shop by User ID - ✅ Long parameter
     */
    public ResponseEntity<CommonApiResponse> getShopByUserId(Long userId) {  // int -> Long
        LOG.info("Request received for get shop by user id: {}", userId);

        try {
            GroceryStore store = groceryStoreService.getShopByUserId(userId);
            if (store == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(CommonApiResponse.error("Shop not found for user: " + userId));
            }
            return ResponseEntity.ok(CommonApiResponse.success("Shop found", store));
        } catch (Exception e) {
            LOG.error("Error fetching shop by user id: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Approve Shop (Admin) - ✅ Long parameter
     */
    public ResponseEntity<CommonApiResponse> approveShop(Long storeId) {  // int -> Long
        LOG.info("Request received for approve shop: {}", storeId);

        try {
            GroceryStore store = groceryStoreService.approveShop(storeId);
            return ResponseEntity.ok(CommonApiResponse.success("Shop approved successfully", store));
        } catch (Exception e) {
            LOG.error("Error approving shop: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reject Shop (Admin) - ✅ Long parameter
     */
    public ResponseEntity<CommonApiResponse> rejectShop(Long storeId) {  // int -> Long
        LOG.info("Request received for reject shop: {}", storeId);

        try {
            GroceryStore store = groceryStoreService.rejectShop(storeId);
            return ResponseEntity.ok(CommonApiResponse.success("Shop rejected", store));
        } catch (Exception e) {
            LOG.error("Error rejecting shop: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get All Shops (Admin)
     */
    public ResponseEntity<CommonApiResponse> getAllShops() {
        LOG.info("Request received for get all shops");

        try {
            List<GroceryStore> shops = groceryStoreService.getAllShops();
            return ResponseEntity.ok(CommonApiResponse.success("All shops fetched", shops));
        } catch (Exception e) {
            LOG.error("Error fetching all shops: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("Failed to fetch shops"));
        }
    }

    /**
     * Get Pending Shops (Admin)
     */
    public ResponseEntity<CommonApiResponse> getPendingShops() {
        LOG.info("Request received for get pending shops");

        try {
            List<GroceryStore> shops = groceryStoreService.getPendingShops();
            return ResponseEntity.ok(CommonApiResponse.success("Pending shops fetched", shops));
        } catch (Exception e) {
            LOG.error("Error fetching pending shops: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("Failed to fetch pending shops"));
        }
    }

    /**
     * Delete Shop (Admin)
     */
    public ResponseEntity<CommonApiResponse> deleteShop(Long storeId) {  // ✅ Long
        LOG.info("Request received for delete shop: {}", storeId);

        try {
            groceryStoreService.deleteShop(storeId);
            return ResponseEntity.ok(CommonApiResponse.success("Shop deleted successfully"));
        } catch (Exception e) {
            LOG.error("Error deleting shop: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update Shop
     */
    public ResponseEntity<CommonApiResponse> updateShop(Long storeId, GroceryStore updatedStore) {  // ✅ Long
        LOG.info("Request received for update shop: {}", storeId);

        try {
            GroceryStore store = groceryStoreService.updateShop(storeId, updatedStore);
            return ResponseEntity.ok(CommonApiResponse.success("Shop updated successfully", store));
        } catch (Exception e) {
            LOG.error("Error updating shop: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Toggle Shop Status (Open/Close)
     */
    public ResponseEntity<CommonApiResponse> toggleShopStatus(Long storeId) {  // ✅ Long
        LOG.info("Request received for toggle shop status: {}", storeId);

        try {
            GroceryStore store = groceryStoreService.toggleShopStatus(storeId);
            String status = store.isOpen() ? "opened" : "closed";
            return ResponseEntity.ok(CommonApiResponse.success("Shop " + status + " successfully", store));
        } catch (Exception e) {
            LOG.error("Error toggling shop status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonApiResponse.error(e.getMessage()));
        }
    }
}