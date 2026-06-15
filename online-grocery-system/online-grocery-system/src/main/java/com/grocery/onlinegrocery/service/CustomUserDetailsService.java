// 📁 com.grocery.onlinegrocery.service.CustomUserDetailsService.java

package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.config.CustomUserDetails;

import com.grocery.onlinegrocery.repository.UserRepository;
import com.grocery.onlinegrocery.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new CustomUserDetails(user);  
    }
}