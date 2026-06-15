// 📁 com.grocery.onlinegrocery.controller.UploadController.java

package com.grocery.onlinegrocery.controller;

import com.grocery.onlinegrocery.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class UploadController {

    private String uploadPath = "C:/Users/user/eclipse-workspace/Advanced Java/online-grocery-system/online-grocery-system/uploads/";

    @PostMapping("/upload")
    public ApiResponse uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            System.out.println("📤 Uploading file: " + file.getOriginalFilename());

            if (file.isEmpty()) {
                return ApiResponse.error("File is empty");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ApiResponse.error("Only image files are allowed");
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ApiResponse.error("File size should be less than 5MB");
            }

            File directory = new File(uploadPath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // ✅ ORIGINAL FILENAME (NO UUID)
            String originalFilename = file.getOriginalFilename();
            String fileName = originalFilename;
            String filePath = uploadPath + fileName;

            Path path = Paths.get(filePath);
            Files.write(path, file.getBytes());

            Map<String, String> responseData = new HashMap<>();
            responseData.put("url", "http://localhost:8085/uploads/" + fileName);
            responseData.put("fileName", fileName);
            responseData.put("originalName", originalFilename);

            System.out.println("✅ File uploaded: " + fileName);
            System.out.println("✅ Path: " + filePath);

            return ApiResponse.success("Image uploaded successfully", responseData);

        } catch (IOException e) {
            System.err.println("❌ Upload error: " + e.getMessage());
            return ApiResponse.error("Failed to upload image: " + e.getMessage());
        }
    }
}