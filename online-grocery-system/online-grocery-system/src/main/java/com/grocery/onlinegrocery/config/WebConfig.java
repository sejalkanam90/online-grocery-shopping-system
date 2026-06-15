// 📁 com.grocery.onlinegrocery.config.WebConfig.java (UPDATED)

package com.grocery.onlinegrocery.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://localhost:5175",
                    "http://localhost:8085"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ For general uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        
        // ✅ SPECIFIC: For shop images (optional but good practice)
        registry.addResourceHandler("/uploads/shops/**")
                .addResourceLocations("file:uploads/shops/");
    }
}