package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import com.grocery.onlinegrocery.entity.Category;
import com.grocery.onlinegrocery.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:8085"})
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // GET ALL
    @GetMapping
    public ResponseEntity<ApiResponse> getAll() {
        try {
            List<Category> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully", categories));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
        try {
            Category category = categoryService.getCategoryById(id);
            return ResponseEntity.ok(ApiResponse.success("Category found", category));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // GET BY STORE
    @GetMapping("/store/{storeId}")
    public ResponseEntity<ApiResponse> getByStore(@PathVariable Long storeId) {
        try {
            System.out.println("=== Fetching categories for storeId: " + storeId);
            List<Category> categories = categoryService.getCategoriesByGroceryShop(storeId);
            System.out.println("Categories found: " + categories.size());
            return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully", categories));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ✅ ADD CATEGORY - FIXED
    @PostMapping
    public ResponseEntity<ApiResponse> add(@RequestBody Category category) {
        try {
            System.out.println("=== Adding category ===");
            System.out.println("Received category: " + category);
            System.out.println("Category name: " + category.getName());
            System.out.println("Category groceryShopId: " + category.getGroceryShopId());
            
            Category newCategory = categoryService.addCategory(category);
            return ResponseEntity.ok(ApiResponse.success("Category added successfully", newCategory));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id, @RequestBody Category category) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updatedCategory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}