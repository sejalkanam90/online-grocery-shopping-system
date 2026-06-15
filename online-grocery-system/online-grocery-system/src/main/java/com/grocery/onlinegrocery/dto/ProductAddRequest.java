// 📁 com.grocery.onlinegrocery.dto.ProductAddRequest.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;
import java.math.BigDecimal;

import com.grocery.onlinegrocery.entity.Product;

@Data
public class ProductAddRequest {
    private int productId;
    private String name;
    private String description;
    private BigDecimal price;
    private int quantity;
    private int categoryId;
    private int groceryShopId;
    private String image1;
    private String image2;
    private String image3;
    
    // Convert to Entity
    public static Product toEntity(ProductAddRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        return product;
    }
}