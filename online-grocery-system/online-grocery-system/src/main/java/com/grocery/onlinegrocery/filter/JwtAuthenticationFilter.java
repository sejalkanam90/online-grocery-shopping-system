// 📁 com.grocery.onlinegrocery.filter.JwtAuthenticationFilter.java

package com.grocery.onlinegrocery.filter;

import com.grocery.onlinegrocery.service.CustomUserDetailsService;
import com.grocery.onlinegrocery.utility.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getServletPath();
        
        // ✅ PUBLIC PATHS - Skip JWT validation
        String[] publicPaths = {
            "/api/shops/register",
            "/api/users/register",
            "/api/users/login",
            "/api/auth/login",
            "/api/shops/approved",
            "/uploads/"
        };
        
        for (String path : publicPaths) {
            if (requestPath.startsWith(path)) {
                filterChain.doFilter(request, response);
                return;
            }
        }
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtUtil.extractEmail(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
                
                if (jwtUtil.validateToken(jwt, userEmail)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    logger.info("✅ Authenticated user: {} with role: {}", userEmail, userDetails.getAuthorities());
                }
            }
        } catch (Exception e) {
            logger.error("❌ JWT authentication error: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
}