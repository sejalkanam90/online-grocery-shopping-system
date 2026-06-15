// 📁 com.grocery.onlinegrocery.resource.CategoryResource.java

package com.grocery.onlinegrocery.resource;

import com.grocery.onlinegrocery.dto.CommonApiResponse;
import com.grocery.onlinegrocery.entity.Category;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.service.CategoryService;
import com.grocery.onlinegrocery.service.GroceryStoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class CategoryResource {

    private static final Logger LOG = LoggerFactory.getLogger(CategoryResource.class);

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private GroceryStoreService groceryStoreService;

    // Add Category
    public ResponseEntity<CommonApiResponse> addCategory(Category category, Long groceryShopId) {
        LOG.info("Request received for add category for shop: {}", groceryShopId);

        try {
            GroceryStore store = groceryStoreService.getGroceryStoreById(groceryShopId);
            if (store == null) {
                return new ResponseEntity<>(CommonApiResponse.error("Grocery Shop not found"), HttpStatus.NOT_FOUND);
            }

            category.setGroceryShop(store);
            Category savedCategory = categoryService.addCategory(category);
            return ResponseEntity.ok(CommonApiResponse.success("Category added successfully", savedCategory));
        } catch (Exception e) {
            LOG.error("Error adding category: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Get All Categories
    public ResponseEntity<CommonApiResponse> getAllCategories() {
        LOG.info("Request received for get all categories");

        try {
            List<Category> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(CommonApiResponse.success("Categories fetched successfully", categories));
        } catch (Exception e) {
            LOG.error("Error fetching categories: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error("Failed to fetch categories"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Categories by Grocery Shop
    public ResponseEntity<CommonApiResponse> getCategoriesByGroceryShop(Long groceryShopId) {
        LOG.info("Request received for get categories by grocery shop: {}", groceryShopId);

        try {
            List<Category> categories = categoryService.getCategoriesByGroceryShop(groceryShopId);
            return ResponseEntity.ok(CommonApiResponse.success("Categories fetched successfully", categories));
        } catch (Exception e) {
            LOG.error("Error fetching categories by shop: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error("Failed to fetch categories"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update Category
    public ResponseEntity<CommonApiResponse> updateCategory(Long categoryId, Category category) {
        LOG.info("Request received for update category: {}", categoryId);

        try {
            Category updatedCategory = categoryService.updateCategory(categoryId, category);
            return ResponseEntity.ok(CommonApiResponse.success("Category updated successfully", updatedCategory));
        } catch (Exception e) {
            LOG.error("Error updating category: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Delete Category
    public ResponseEntity<CommonApiResponse> deleteCategory(Long categoryId) {
        LOG.info("Request received for delete category: {}", categoryId);

        try {
            categoryService.deleteCategory(categoryId);
            return ResponseEntity.ok(CommonApiResponse.success("Category deleted successfully"));
        } catch (Exception e) {
            LOG.error("Error deleting category: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Get Category by ID
    public ResponseEntity<CommonApiResponse> getCategoryById(Long categoryId) {
        LOG.info("Request received for get category by id: {}", categoryId);

        try {
            Category category = categoryService.getCategoryById(categoryId);
            return ResponseEntity.ok(CommonApiResponse.success("Category found", category));
        } catch (Exception e) {
            LOG.error("Error fetching category: {}", e.getMessage());
            return new ResponseEntity<>(CommonApiResponse.error(e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }
}