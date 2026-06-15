// 📁 com.grocery.onlinegrocery.dto.LoginRequest.java

package com.grocery.onlinegrocery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
}