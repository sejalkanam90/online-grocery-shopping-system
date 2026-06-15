package com.grocery.onlinegrocery.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class PaymentService {

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    // =========================
    // CREATE ORDER
    // =========================
    public Order createOrder(int amount, String userId, String type) throws Exception {

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject request = new JSONObject();
        request.put("amount", amount); // paise
        request.put("currency", "INR");
        request.put("receipt", "rcpt_" + System.currentTimeMillis());
        request.put("payment_capture", 1);

        JSONObject notes = new JSONObject();
        notes.put("userId", userId);
        notes.put("orderType", type);
        notes.put("source", "ONLINE_GROCERY_APP");

        request.put("notes", notes);

        return client.orders.create(request);
    }

    // =========================
    // VERIFY SIGNATURE
    // =========================
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;

            Mac sha256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(keySecret.getBytes(), "HmacSHA256");
            sha256.init(secret_key);

            byte[] hash = sha256.doFinal(data.getBytes());

            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }

            return sb.toString().equals(signature);

        } catch (Exception e) {
            return false;
        }
    }
}