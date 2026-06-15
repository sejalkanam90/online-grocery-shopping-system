package com.grocery.onlinegrocery.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PaymentController {

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    // 1️⃣ Create Order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            int amount = (int) request.get("amount");
            String userId = (String) request.getOrDefault("userId", "");
            String type = (String) request.getOrDefault("type", "cart");

            System.out.println("📝 Creating order - Amount: " + amount + ", UserId: " + userId);

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());
            orderRequest.put("payment_capture", 1);

            // Add notes
            JSONObject notes = new JSONObject();
            notes.put("userId", userId);
            notes.put("type", type);
            orderRequest.put("notes", notes);

            Order order = razorpay.orders.create(orderRequest);

            System.out.println("✅ Order created: " + order.get("id"));

            Map<String, Object> response = new HashMap<>();
            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", razorpayKeyId);

            return ResponseEntity.ok(response);

        } catch (RazorpayException e) {
            System.err.println("❌ Razorpay Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ General Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // 2️⃣ Verify Payment Signature
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> request) {
        try {
            String orderId = (String) request.get("orderId");
            String paymentId = (String) request.get("paymentId");
            String signature = (String) request.get("signature");
            String type = (String) request.get("type");
            String userId = (String) request.getOrDefault("userId", "");
            String amount = (String) request.getOrDefault("amount", "0");

            System.out.println("📝 Verifying payment - OrderId: " + orderId + ", PaymentId: " + paymentId);

            // Verify signature
            String generatedSignature = generateSignature(orderId + "|" + paymentId, razorpayKeySecret);

            if (generatedSignature.equals(signature)) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment verified successfully",
                    "type", type,
                    "userId", userId,
                    "amount", amount
                ));
            } else {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Invalid signature"));
            }
        } catch (Exception e) {
            System.err.println("❌ Verification Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Helper method to generate signature
    private String generateSignature(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] bytes = mac.doFinal(data.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}