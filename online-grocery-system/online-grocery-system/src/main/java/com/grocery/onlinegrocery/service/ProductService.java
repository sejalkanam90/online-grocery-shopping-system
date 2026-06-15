package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.ProductResponseDto;
import com.grocery.onlinegrocery.entity.Product;
import com.grocery.onlinegrocery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product addProduct(Product product) {
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product updateProduct(Product product) {
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<ProductResponseDto> getAllProductsDto() {
        return productRepository.findAll().stream()
                .map(ProductResponseDto::fromProduct)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getProductsByCategoryDto(Long id) {
        return productRepository.findByCategoryId(id).stream()
                .map(ProductResponseDto::fromProduct)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getProductsByGroceryShopWithCategoryDto(Long id) {
        return productRepository.findByGroceryShopId(id).stream()
                .map(ProductResponseDto::fromProduct)
                .collect(Collectors.toList());
    }
}