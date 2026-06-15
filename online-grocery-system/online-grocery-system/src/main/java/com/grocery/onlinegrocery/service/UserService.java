package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.LoginRequest;
import com.grocery.onlinegrocery.dto.RegisterRequest;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.UserRepository;
import com.grocery.onlinegrocery.utility.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private static final Logger LOG =
            LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ===============================
    // REGISTER USER
    // ===============================
    @Transactional
    public User registerUser(RegisterRequest request) {

        LOG.info("Registering new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());

        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhone(request.getPhone());

        user.setRole(request.getRole());

        user.setActive(true);

        user.setCreatedAt(LocalDateTime.now());

        user.setUpdatedAt(LocalDateTime.now());

        // DELIVERY DETAILS
        if (request.getRole() == User.Role.DELIVERY) {

            user.setAadharNumber(request.getAadharNumber());

            user.setVehicleType(request.getVehicleType());

            user.setVehicleNumber(request.getVehicleNumber());

            user.setDeliveryStatus(
                    User.DeliveryStatus.AVAILABLE
            );

            LOG.info(
                    "Registered DELIVERY person with Aadhar: {}",
                    request.getAadharNumber()
            );
        }

        return userRepository.save(user);
    }

    // ===============================
    // LOGIN USER
    // ===============================
    public User loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())

                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        // PASSWORD CHECK
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        // ACTIVE CHECK
        if (!user.isActive()) {

            throw new RuntimeException(
                    "Account is deactivated"
            );
        }

        return user;
    }

    // ===============================
    // ✅ GENERATE JWT TOKEN
    // ===============================
    public String generateToken(User user) {

        // IMPORTANT:
        // This method adds:
        // id, email, role into token

        return jwtUtil.generateToken(user);
    }

    // ===============================
    // GET USER BY ID
    // ===============================
    public User getUserById(Long userId) {

        LOG.info("Getting user by id: {}", userId);

        return userRepository.findById(userId)

                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + userId
                        )
                );
    }

    // ===============================
    // GET USER BY EMAIL
    // ===============================
    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)

                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        )
                );
    }

    // ===============================
    // GET ALL USERS
    // ===============================
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    // ===============================
    // GET USERS BY ROLE
    // ===============================
    public List<User> getUsersByRole(User.Role role) {

        return userRepository.findByRole(role);
    }

    // ===============================
    // GET AVAILABLE DELIVERY PERSONS
    // ===============================
    public List<User> getAvailableDeliveryPersons() {

        return userRepository.findByRoleAndDeliveryStatus(
                User.Role.DELIVERY,
                User.DeliveryStatus.AVAILABLE
        );
    }

    // ===============================
    // UPDATE DELIVERY STATUS
    // ===============================
    @Transactional
    public User updateDeliveryStatus(
            Long userId,
            User.DeliveryStatus status
    ) {

        User user = getUserById(userId);

        if (user.getRole() != User.Role.DELIVERY) {

            throw new RuntimeException(
                    "User is not a delivery person"
            );
        }

        user.setDeliveryStatus(status);

        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    // ===============================
    // UPDATE USER
    // ===============================
    @Transactional
    public User updateUser(User user) {

        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    // ===============================
    // GET ACTIVE USERS
    // ===============================
    public List<User> getActiveUsers() {

        return userRepository.findByActive(true);
    }

    // ===============================
    // UPDATE USER PROFILE
    // ===============================
    @Transactional
    public User updateUserProfile(
            Long userId,
            User updatedUser
    ) {

        User user = getUserById(userId);

        user.setName(updatedUser.getName());

        user.setPhone(updatedUser.getPhone());

        user.setProfileImage(updatedUser.getProfileImage());

        user.setAddress(updatedUser.getAddress());

        user.setCity(updatedUser.getCity());

        user.setState(updatedUser.getState());

        user.setPincode(updatedUser.getPincode());

        user.setLandmark(updatedUser.getLandmark());

        // DELIVERY DETAILS
        if (user.getRole() == User.Role.DELIVERY) {

            user.setVehicleType(
                    updatedUser.getVehicleType()
            );

            user.setVehicleNumber(
                    updatedUser.getVehicleNumber()
            );

            user.setAadharNumber(
                    updatedUser.getAadharNumber()
            );
        }

        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    // ===============================
    // CHANGE PASSWORD
    // ===============================
    @Transactional
    public void changePassword(
            Long userId,
            String oldPassword,
            String newPassword
    ) {

        User user = getUserById(userId);

        // CHECK OLD PASSWORD
        if (!passwordEncoder.matches(
                oldPassword,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Old password is incorrect"
            );
        }

        // UPDATE PASSWORD
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    // ===============================
    // TOGGLE USER STATUS
    // ===============================
    @Transactional
    public User toggleUserStatus(Long userId) {

        User user = getUserById(userId);

        user.setActive(!user.isActive());

        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    // ===============================
    // DELETE USER
    // ===============================
    @Transactional
    public void deleteUser(Long userId) {

        if (!userRepository.existsById(userId)) {

            throw new RuntimeException(
                    "User not found with id: " + userId
            );
        }

        userRepository.deleteById(userId);
    }

    // ===============================
    // COUNT USERS BY ROLE
    // ===============================
    public long countUsersByRole(User.Role role) {

        return userRepository.countByRole(role);
    }

    // ===============================
    // SEARCH USERS BY NAME
    // ===============================
    public List<User> searchUsersByName(String name) {

        return userRepository.findByNameContainingIgnoreCase(name);
    }
}