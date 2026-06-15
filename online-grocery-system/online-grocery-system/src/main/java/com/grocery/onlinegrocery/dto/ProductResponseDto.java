// 📁 com.grocery.onlinegrocery.dto.ProductResponseDto.java

package com.grocery.onlinegrocery.dto;

import com.grocery.onlinegrocery.entity.Product;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductResponseDto {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int quantity;
    private String image1;
    private String image2;
    private String image3;
    private String status;
    private Long categoryId;
    private String categoryName;
    private Long groceryShopId;
    private String groceryShopName;
    private String unit;

    private static final String BASE_URL = "http://localhost:8085/uploads/";

    public static ProductResponseDto fromProduct(Product product) {
        ProductResponseDto dto = new ProductResponseDto();

        if (product == null) {
            return dto;
        }

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setStatus(product.getStatus());
        dto.setUnit(product.getUnit());

        // Images
        dto.setImage1(product.getImage1() != null ? BASE_URL + product.getImage1() : null);
        dto.setImage2(product.getImage2() != null ? BASE_URL + product.getImage2() : null);
        dto.setImage3(product.getImage3() != null ? BASE_URL + product.getImage3() : null);

        // Category
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        // Grocery Shop
        if (product.getGroceryShop() != null) {
            dto.setGroceryShopId(product.getGroceryShop().getId());
            dto.setGroceryShopName(product.getGroceryShop().getStoreName());
        }

        return dto;
    }
}