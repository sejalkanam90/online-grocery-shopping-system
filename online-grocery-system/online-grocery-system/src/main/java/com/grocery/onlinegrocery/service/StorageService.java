package com.grocery.onlinegrocery.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Objects;

@Service
public class StorageService {

    
    private final Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();

    public String store(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) return null;

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
            String extension = originalFilename.contains(".") ? 
                               originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            
            String nameWithoutExtension = originalFilename.contains(".") ? 
                                          originalFilename.substring(0, originalFilename.lastIndexOf(".")) : originalFilename;

         
            nameWithoutExtension = nameWithoutExtension.replaceAll("\\s+", "_");
            
           
            String filename = nameWithoutExtension + "_" + System.currentTimeMillis() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("✅ Saved to: " + filePath);
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file: " + e.getMessage());
        }
    }

    public void delete(String filename) {
        if (filename == null || filename.isEmpty()) return;
        try {
            Path filePath = uploadPath.resolve(filename).normalize();
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                System.out.println("🗑️ Successfully Deleted from folder: " + filename);
            } else {
                System.out.println("⚠️ File not found, skipped delete: " + filename);
            }
        } catch (IOException e) {
            System.err.println("❌ Error deleting file " + filename + ": " + e.getMessage());
        }
    }
}