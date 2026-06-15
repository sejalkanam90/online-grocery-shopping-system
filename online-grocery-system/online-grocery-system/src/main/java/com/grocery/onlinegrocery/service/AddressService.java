// 📁 com.grocery.onlinegrocery.service.AddressService.java

package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.AddressRequest;
import com.grocery.onlinegrocery.entity.Address;
import com.grocery.onlinegrocery.entity.User;
import com.grocery.onlinegrocery.repository.AddressRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AddressService {

    private static final Logger LOG = LoggerFactory.getLogger(AddressService.class);

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserService userService;

    /**
     * Add Address - ✅ Corrected
     */
    @Transactional
    public Address addAddress(Long userId, AddressRequest request) {
        LOG.info("Adding address for user: {}", userId);

        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Address address = new Address();
        address.setUser(user);
        address.setAddressType(request.getAddressType());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setLandmark(request.getLandmark());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setReceiverName(request.getReceiverName());
        address.setDefault(request.isDefault());
        address.setCreatedAt(LocalDateTime.now());

        // If this is the first address or marked as default, set as default
        List<Address> existingAddresses = addressRepository.findByUser(user);
        if (request.isDefault() || existingAddresses.isEmpty()) {
            // Remove default from other addresses
            for (Address addr : existingAddresses) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
            address.setDefault(true);
        }

        return addressRepository.save(address);
    }

    /**
     * Get Addresses by User
     */
    public List<Address> getAddressesByUser(Long userId) {
        LOG.info("Getting addresses for user: {}", userId);
        User user = userService.getUserById(userId);
        return addressRepository.findByUser(user);
    }

    /**
     * Get Default Address
     */
    public Address getDefaultAddress(Long userId) {
        LOG.info("Getting default address for user: {}", userId);
        User user = userService.getUserById(userId);
        return addressRepository.findByUserAndIsDefaultTrue(user)
                .orElseThrow(() -> new RuntimeException("No default address found"));
    }

    /**
     * Update Address
     */
    @Transactional
    public Address updateAddress(Long addressId, AddressRequest request) {
        LOG.info("Updating address: {}", addressId);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        address.setAddressType(request.getAddressType());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setLandmark(request.getLandmark());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setReceiverName(request.getReceiverName());
        address.setUpdatedAt(LocalDateTime.now());

        return addressRepository.save(address);
    }

    /**
     * Set Default Address
     */
    @Transactional
    public Address setDefaultAddress(Long userId, Long addressId) {
        LOG.info("Setting default address for user: {}, address: {}", userId, addressId);

        User user = userService.getUserById(userId);
        
        // Remove default from all addresses
        List<Address> addresses = addressRepository.findByUser(user);
        for (Address addr : addresses) {
            addr.setDefault(false);
            addressRepository.save(addr);
        }
        
        // Set new default address
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        address.setDefault(true);
        address.setUpdatedAt(LocalDateTime.now());
        
        return addressRepository.save(address);
    }

    /**
     * Delete Address
     */
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        LOG.info("Deleting address: {} for user: {}", addressId, userId);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Verify address belongs to user
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to user");
        }

        // Cannot delete default address
        if (address.isDefault()) {
            throw new RuntimeException("Cannot delete default address. Set another address as default first.");
        }

        addressRepository.delete(address);
    }
}