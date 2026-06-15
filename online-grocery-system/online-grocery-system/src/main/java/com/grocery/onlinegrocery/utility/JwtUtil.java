package com.grocery.onlinegrocery.utility;

import com.grocery.onlinegrocery.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    // ===============================
    // GET SIGNING KEY
    // ===============================
    private Key getSigningKey() {

        byte[] keyBytes = secret.getBytes();

        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ===============================
    // GENERATE TOKEN WITH EMAIL
    // ===============================
    public String generateToken(String email) {

        Map<String, Object> claims = new HashMap<>();

        return createToken(claims, email);
    }

    // ===============================
    // GENERATE TOKEN WITH EMAIL + ROLE
    // ===============================
    public String generateToken(
            String email,
            String role
    ) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("role", role);

        return createToken(claims, email);
    }

    // ===============================
    // ✅ GENERATE TOKEN WITH USER
    // ===============================
    public String generateToken(User user) {

        Map<String, Object> claims = new HashMap<>();

        // IMPORTANT CLAIMS
        claims.put("id", user.getId());

        claims.put("email", user.getEmail());

        claims.put("role", user.getRole().name());

        return createToken(
                claims,
                user.getEmail()
        );
    }

    // ===============================
    // CREATE TOKEN
    // ===============================
    private String createToken(
            Map<String, Object> claims,
            String subject
    ) {

        return Jwts.builder()

                .setClaims(claims)

                .setSubject(subject)

                .setIssuedAt(
                        new Date(System.currentTimeMillis())
                )

                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expiration
                        )
                )

                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )

                .compact();
    }

    // ===============================
    // EXTRACT EMAIL
    // ===============================
    public String extractEmail(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    // ===============================
    // EXTRACT USERNAME
    // ===============================
    public String extractUsername(String token) {

        return extractEmail(token);
    }

    // ===============================
    // ✅ EXTRACT USER ID
    // ===============================
    public Long extractUserId(String token) {

        Claims claims = extractAllClaims(token);

        Object id = claims.get("id");

        // NULL SAFETY
        if (id == null) {

            System.out.println(
                    "❌ ID claim not found in token"
            );

            return null;
        }

        if (id instanceof Integer) {

            return ((Integer) id).longValue();
        }

        if (id instanceof Long) {

            return (Long) id;
        }

        return Long.parseLong(id.toString());
    }

    // ===============================
    // EXTRACT ROLE
    // ===============================
    public String extractRole(String token) {

        Claims claims = extractAllClaims(token);

        return (String) claims.get("role");
    }

    // ===============================
    // EXTRACT EXPIRATION
    // ===============================
    public Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }

    // ===============================
    // EXTRACT CLAIM
    // ===============================
    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {

        final Claims claims =
                extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    // ===============================
    // EXTRACT ALL CLAIMS
    // ===============================
    public Claims extractClaims(String token) {

        return extractAllClaims(token);
    }

    // ===============================
    // PARSE TOKEN
    // ===============================
    private Claims extractAllClaims(String token) {

        return Jwts.parserBuilder()

                .setSigningKey(getSigningKey())

                .build()

                .parseClaimsJws(token)

                .getBody();
    }

    // ===============================
    // CHECK TOKEN EXPIRY
    // ===============================
    private Boolean isTokenExpired(String token) {

        return extractExpiration(token)

                .before(new Date());
    }

    // ===============================
    // VALIDATE TOKEN WITH EMAIL
    // ===============================
    public Boolean validateToken(
            String token,
            String email
    ) {

        final String extractedEmail =
                extractEmail(token);

        return (
                extractedEmail.equals(email)
                        && !isTokenExpired(token)
        );
    }

    // ===============================
    // VALIDATE TOKEN WITH USERDETAILS
    // ===============================
    public Boolean validateToken(
            String token,
            org.springframework.security.core.userdetails.UserDetails userDetails
    ) {

        final String extractedEmail =
                extractEmail(token);

        return (
                extractedEmail.equals(
                        userDetails.getUsername()
                )
                        && !isTokenExpired(token)
        );
    }
}