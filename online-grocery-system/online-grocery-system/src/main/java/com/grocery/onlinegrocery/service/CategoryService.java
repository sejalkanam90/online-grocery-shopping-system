package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.entity.Category;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.repository.CategoryRepository;
import com.grocery.onlinegrocery.repository.GroceryStoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private GroceryStoreRepository groceryStoreRepository;

    // ✅ ADD CATEGORY
    @Transactional
    public Category addCategory(Category category) {
        
        // Debug log
        System.out.println("📥 Category received: " + category);
        System.out.println("📥 groceryShopId: " + category.getGroceryShopId());
        
        // Check groceryShopId
        Long storeId = category.getGroceryShopId();
        
        if (storeId == null) {
            throw new RuntimeException("Grocery shop ID is required");
        }

        GroceryStore shop = groceryStoreRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + storeId));

        category.setGroceryShop(shop);
        category.setActive(true);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }

    // GET ALL
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // GET BY ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
    }

    // GET BY STORE
    public List<Category> getCategoriesByGroceryShop(Long storeId) {
        return categoryRepository.findByGroceryShop_Id(storeId);
    }

    // UPDATE
    @Transactional
    public Category updateCategory(Long id, Category category) {
        Category existing = getCategoryById(id);
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        existing.setUpdatedAt(LocalDateTime.now());
        return categoryRepository.save(existing);
    }

    // DELETE
    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}