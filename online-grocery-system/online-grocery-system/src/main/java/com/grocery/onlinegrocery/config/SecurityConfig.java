package com.grocery.onlinegrocery.config;

import com.grocery.onlinegrocery.filter.JwtAuthenticationFilter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // =========================
    // PASSWORD ENCODER
    // =========================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================
    // SECURITY FILTER CHAIN
    // =========================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http

            // Disable CSRF
            .csrf(AbstractHttpConfigurer::disable)

            // Enable CORS
            .cors(Customizer.withDefaults())

            // Stateless Session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // =========================
            // API AUTHORIZATION
            // =========================
            .authorizeHttpRequests(auth -> auth

                // =====================================================
                // 1. PUBLIC APIs (NO LOGIN REQUIRED)
                // =====================================================
                .requestMatchers(
                    "/api/auth/**",
                    "/api/shops/register",
                    "/api/shops/approved",
                    "/api/shops/{id}",
                    "/api/locations",
                    "/uploads/**",
                    "/api/product/fetch/**",
                    "/api/categories/store/**"
                ).permitAll()

                // =====================================================
                // 2. ADMIN ONLY APIs
                // =====================================================
                .requestMatchers(
                    "/api/admin/**",
                    "/api/orders/all"
                ).hasRole("ADMIN")

                // =====================================================
                // 3. DELIVERY + SHOP APIs
                // =====================================================
                .requestMatchers(
                    "/api/delivery/requests/**",
                    "/api/delivery/request",
                    "/api/delivery/my-shops/**"
                ).hasAnyRole("DELIVERY", "SHOP", "ADMIN")

                // =====================================================
                // 4. DELIVERY ONLY APIs
                // =====================================================
                .requestMatchers(
                    "/api/orders/delivery/**",
                    "/api/delivery/check/**",
                    "/api/delivery/persons/**"
                ).hasAnyRole("DELIVERY", "ADMIN")

                // =====================================================
                // 5. SHOP + ADMIN APIs
                // =====================================================
                .requestMatchers(
                    "/api/shops/**",
                    "/api/categories/**",
                    "/api/products/**",
                    "/api/product/**",
                    "/api/orders/shop/**",
                    "/api/shop-wallet/**"
                ).hasAnyRole("SHOP", "ADMIN")

                // =====================================================
                // 6. CUSTOMER APIs
                // =====================================================
                .requestMatchers(
                    "/api/orders/user/**",
                    "/api/cart/**",
                    "/api/addresses/**"
                ).hasAnyRole("CUSTOMER", "ADMIN")

                // =====================================================
                // 7. WALLET APIs
                // =====================================================
                .requestMatchers(
                    "/api/wallet/**"
                ).hasAnyRole("SHOP", "CUSTOMER", "ADMIN")

                // =====================================================
                // 8. COMMON AUTHENTICATED APIs
                // =====================================================
                .requestMatchers(
                    "/api/users/me"
                ).authenticated()

                // =====================================================
                // 9. ALL OTHER APIs
                // =====================================================
                .anyRequest().authenticated()
            )

            // =========================
            // JWT FILTER
            // =========================
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}