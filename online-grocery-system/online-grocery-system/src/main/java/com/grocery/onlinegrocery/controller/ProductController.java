// 📁 com.grocery.onlinegrocery.controller.ProductController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.*;
import com.grocery.onlinegrocery.resource.ProductResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/product")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8085"
})
public class ProductController {

    @Autowired
    private ProductResource productResource;

    // ==================== ADD PRODUCT ====================
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse> addProduct(
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("groceryShopId") Long groceryShopId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image1", required = false) MultipartFile image1,
            @RequestParam(value = "image2", required = false) MultipartFile image2,
            @RequestParam(value = "image3", required = false) MultipartFile image3) {

        return productResource.addProduct(
                name, price, quantity, categoryId, groceryShopId,
                description, image1, image2, image3
        );
    }

    // ==================== UPDATE PRODUCT DETAILS ====================
    @PutMapping("/update/detail")
    public ResponseEntity<CommonApiResponse> updateProductDetails(
            @RequestBody ProductDetailUpdateRequest request) {
        return productResource.updateProductDetail(request);
    }

    // ==================== UPDATE PRODUCT IMAGES ====================
    @PutMapping(value = "/update/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse> updateProductImage(
            @RequestParam("productId") Long productId,
            @RequestParam(value = "image1", required = false) MultipartFile image1,
            @RequestParam(value = "image2", required = false) MultipartFile image2,
            @RequestParam(value = "image3", required = false) MultipartFile image3) {

        return productResource.updateProductImage(productId, image1, image2, image3);
    }

    // ==================== DELETE PRODUCT ====================
    @DeleteMapping("/delete")
    public ResponseEntity<CommonApiResponse> deleteProduct(
            @RequestParam("productId") Long productId,
            @RequestParam("groceryShopId") Long groceryShopId) {

        return productResource.deleteProduct(productId, groceryShopId);
    }

    // ==================== FETCH PRODUCT BY ID ====================
    @GetMapping("/fetch")
    public ResponseEntity<ProductResponseDto> fetchProductById(
            @RequestParam("productId") Long productId) {

        return productResource.fetchProductById(productId);
    }

    // ==================== FETCH ALL PRODUCTS ====================
    @GetMapping("/fetch/all")
    public ResponseEntity<CommonApiResponse> fetchAllProducts() {
        return productResource.fetchAllProducts();
    }

    // ==================== FETCH PRODUCTS BY CATEGORY ====================
    @GetMapping("/fetch/category-wise")
    public ResponseEntity<CommonApiResponse> fetchAllProductsByCategory(
            @RequestParam("categoryId") Long categoryId) {

        return productResource.fetchProductsByCategory(categoryId);
    }

    // ==================== FETCH PRODUCTS BY GROCERY SHOP (Query Param) ====================
    @GetMapping("/fetch/groceryShop-wise")
    public ResponseEntity<CommonApiResponse> fetchAllGroceryShopProducts(
            @RequestParam("groceryShopId") Long groceryShopId) {

        return productResource.fetchProductsByGroceryShop(groceryShopId);
    }

    // ✅ FETCH PRODUCTS BY SHOP ID (Path Variable)
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<CommonApiResponse> getProductsByShopId(@PathVariable Long shopId) {
        try {
            System.out.println("🔵 Fetching products for shop ID: " + shopId);
            
            ResponseEntity<CommonApiResponse> response = productResource.fetchProductsByGroceryShop(shopId);
            
            System.out.println("🔵 Response status: " + response.getStatusCode());
            
            return response;
            
        } catch (Exception e) {
            System.err.println("🔴 Error in getProductsByShopId: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonApiResponse.error("Failed to fetch products: " + e.getMessage()));
        }
    }

    // ==================== GET PRODUCT IMAGE ====================
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> getProductImage(@PathVariable String filename) {
        try {
            if (filename.contains("..")) {
                return ResponseEntity.badRequest().build();
            }

            Path filePath = Paths.get("uploads").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (Exception e) {
            System.err.println("🔴 Error serving image: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}