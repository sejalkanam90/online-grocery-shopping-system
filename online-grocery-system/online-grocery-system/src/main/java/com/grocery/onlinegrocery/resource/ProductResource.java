package com.grocery.onlinegrocery.resource;

import com.grocery.onlinegrocery.dto.CommonApiResponse;
import com.grocery.onlinegrocery.dto.ProductDetailUpdateRequest;
import com.grocery.onlinegrocery.dto.ProductResponseDto;
import com.grocery.onlinegrocery.entity.Category;
import com.grocery.onlinegrocery.entity.GroceryStore;
import com.grocery.onlinegrocery.entity.Product;
import com.grocery.onlinegrocery.service.CategoryService;
import com.grocery.onlinegrocery.service.GroceryStoreService;
import com.grocery.onlinegrocery.service.ProductService;
import com.grocery.onlinegrocery.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Component
public class ProductResource {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private GroceryStoreService groceryStoreService;

    @Autowired
    private StorageService storageService;

    // ==================== 1. ADD PRODUCT ====================
    public ResponseEntity<CommonApiResponse> addProduct(
            String name, Double price, Integer quantity, Long categoryId,
            Long groceryShopId, String description,
            MultipartFile image1, MultipartFile image2, MultipartFile image3) {

        try {
            if (name == null || name.isEmpty()) {
                return ResponseEntity.badRequest().body(CommonApiResponse.error("Product name is required"));
            }

            Category category = categoryService.getCategoryById(categoryId);
            GroceryStore shop = groceryStoreService.getGroceryStoreById(groceryShopId);

            if (category == null || shop == null) {
                return ResponseEntity.badRequest().body(CommonApiResponse.error("Invalid category or shop"));
            }

            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(BigDecimal.valueOf(price));
            product.setQuantity(quantity);
            product.setStatus("ACTIVE");
            product.setCategory(category);
            product.setGroceryShop(shop);
            product.setUnit("piece");

            // फाईल्स सेव्ह करा
            if (image1 != null && !image1.isEmpty()) product.setImage1(storageService.store(image1));
            if (image2 != null && !image2.isEmpty()) product.setImage2(storageService.store(image2));
            if (image3 != null && !image3.isEmpty()) product.setImage3(storageService.store(image3));

            productService.addProduct(product);
            return ResponseEntity.ok(CommonApiResponse.success("Product added successfully", product));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("Failed to add product: " + e.getMessage()));
        }
    }

    // ==================== 2. UPDATE PRODUCT DETAILS (Text Only) ====================
    public ResponseEntity<CommonApiResponse> updateProductDetail(ProductDetailUpdateRequest req) {
        try {
            Product product = productService.getProductById(req.getProductId());
            if (product == null) return ResponseEntity.badRequest().body(CommonApiResponse.error("Product not found"));

            product.setName(req.getName());
            product.setDescription(req.getDescription());
            product.setPrice(req.getPrice());
            product.setQuantity(req.getQuantity());

            if (req.getCategoryId() != null) {
                Category category = categoryService.getCategoryById(req.getCategoryId());
                if (category != null) product.setCategory(category);
            }

            productService.updateProduct(product);
            return ResponseEntity.ok(CommonApiResponse.success("Product details updated successfully", product));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(CommonApiResponse.error(e.getMessage()));
        }
    }

    // ==================== 3. UPDATE PRODUCT IMAGES (With Delete Logic) ====================
    public ResponseEntity<CommonApiResponse> updateProductImage(
            Long productId, MultipartFile image1, MultipartFile image2, MultipartFile image3) {

        try {
            Product product = productService.getProductById(productId);
            if (product == null) return ResponseEntity.badRequest().body(CommonApiResponse.error("Product not found"));

            // Image 1: जर नवीन फाईल आली, तर आधीची जुनी डिलीट करा आणि मग नवीन सेव्ह करा
            if (image1 != null && !image1.isEmpty()) {
                if (product.getImage1() != null) storageService.delete(product.getImage1());
                product.setImage1(storageService.store(image1));
            }

            // Image 2: जुनी डिलीट करा आणि नवीन सेव्ह करा
            if (image2 != null && !image2.isEmpty()) {
                if (product.getImage2() != null) storageService.delete(product.getImage2());
                product.setImage2(storageService.store(image2));
            }

            // Image 3: जुनी डिलीट करा आणि नवीन सेव्ह करा
            if (image3 != null && !image3.isEmpty()) {
                if (product.getImage3() != null) storageService.delete(product.getImage3());
                product.setImage3(storageService.store(image3));
            }

            productService.updateProduct(product);
            return ResponseEntity.ok(CommonApiResponse.success("Product images updated successfully", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("Failed to update images: " + e.getMessage()));
        }
    }

    // ==================== 4. DELETE PRODUCT (Cleanup Folder) ====================
    public ResponseEntity<CommonApiResponse> deleteProduct(Long productId, Long groceryShopId) {
        try {
            Product product = productService.getProductById(productId);
            if (product == null) return ResponseEntity.badRequest().body(CommonApiResponse.error("Product not found"));

            // डेटाबेस मधून काढण्यापूर्वी फोल्डरमधील तिन्ही इमेजेस डिलीट करा
            storageService.delete(product.getImage1());
            storageService.delete(product.getImage2());
            storageService.delete(product.getImage3());

            productService.deleteProduct(productId);
            return ResponseEntity.ok(CommonApiResponse.success("Product and associated images deleted successfully", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("Failed to delete product: " + e.getMessage()));
        }
    }

    // ==================== 5. FETCH METHODS ====================

    public ResponseEntity<ProductResponseDto> fetchProductById(Long id) {
        Product product = productService.getProductById(id);
        if (product == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ProductResponseDto.fromProduct(product));
    }

    public ResponseEntity<CommonApiResponse> fetchAllProducts() {
        List<ProductResponseDto> list = productService.getAllProductsDto();
        return ResponseEntity.ok(CommonApiResponse.success("Products fetched successfully", list));
    }

    public ResponseEntity<CommonApiResponse> fetchProductsByCategory(Long id) {
        List<ProductResponseDto> list = productService.getProductsByCategoryDto(id);
        return ResponseEntity.ok(CommonApiResponse.success("Category products fetched", list));
    }

    public ResponseEntity<CommonApiResponse> fetchProductsByGroceryShop(Long id) {
        List<ProductResponseDto> list = productService.getProductsByGroceryShopWithCategoryDto(id);
        return ResponseEntity.ok(CommonApiResponse.success("Shop products fetched", list));
    }
}