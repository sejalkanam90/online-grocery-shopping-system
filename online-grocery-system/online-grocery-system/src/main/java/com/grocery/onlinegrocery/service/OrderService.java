package com.grocery.onlinegrocery.service;

import com.grocery.onlinegrocery.dto.OrderRequest;
import com.grocery.onlinegrocery.entity.*;
import com.grocery.onlinegrocery.repository.AddressRepository;
import com.grocery.onlinegrocery.repository.OrderItemRepository;
import com.grocery.onlinegrocery.repository.OrderRepository;
import com.grocery.onlinegrocery.repository.ProductRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopWalletService shopWalletService;

    @Autowired
    private AddressRepository addressRepository;

    // ===============================
    // CREATE ORDER FROM CART AFTER RAZORPAY PAYMENT
    // ===============================
    @Transactional
    public Order createOrderFromCart(User user, Long addressId, Double totalAmount, String razorpayPaymentId,
            String razorpayOrderId) {

        System.out.println("📝 createOrderFromCart called:");
        System.out.println("   userId: " + (user != null ? user.getId() : "NULL"));
        System.out.println("   addressId: " + addressId);
        System.out.println("   totalAmount: " + totalAmount);
        System.out.println("   razorpayPaymentId: " + razorpayPaymentId);
        System.out.println("   razorpayOrderId: " + razorpayOrderId);

        if (user == null) {
            throw new RuntimeException("User is null");
        }

        List<Cart> cartItems = cartService.getCartByUser(user);
        System.out.println("   cartItems size: " + (cartItems != null ? cartItems.size() : 0));

        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty for user: " + user.getId());
        }

        Cart firstCartItem = cartItems.get(0);
        if (firstCartItem.getProduct() == null) {
            throw new RuntimeException("Product not found in cart");
        }

        Product product = firstCartItem.getProduct();
        System.out.println("   product: " + (product != null ? product.getName() : "NULL"));

        if (product.getGroceryShop() == null) {
            throw new RuntimeException("Store not found for product: " + product.getName());
        }

        GroceryStore store = product.getGroceryShop();
        System.out.println("   store: " + (store != null ? store.getStoreName() : "NULL"));
        System.out.println("   store ID: " + store.getId());

        // Calculate amounts
        double subtotal = cartItems.stream()
                .mapToDouble(item -> item.getProduct().getPrice().doubleValue() * item.getQuantity()).sum();
        double finalAmount = subtotal;

        System.out.println("   subtotal: " + subtotal);
        System.out.println("   finalAmount: " + finalAmount);

        Order order = new Order();
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUser(user);
        order.setStore(store);
        order.setSubtotal(subtotal);
        order.setFinalAmount(finalAmount);
        order.setPaymentMethod(Order.PaymentMethod.RAZORPAY);
        order.setPaymentStatus(Order.PaymentStatus.SUCCESS);
        order.setOrderStatus(Order.OrderStatus.PENDING);
        order.setRazorpayPaymentId(razorpayPaymentId);
        order.setRazorpayOrderId(razorpayOrderId);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // ✅ Address set करा
        if (addressId != null) {
            Address address = addressRepository.findById(addressId).orElse(null);
            if (address != null) {
                order.setAddress(address);
                System.out.println("✅ Address set for order: " + address.getAddressLine1());
            } else {
                System.out.println("⚠️ Address not found with id: " + addressId);
            }
        }

        Order savedOrder = orderRepository.save(order);
        System.out.println("✅ Order saved with ID: " + savedOrder.getId());

        // Save Order Items
        for (Cart cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice().doubleValue());
            orderItem.setTotal(orderItem.getPrice() * orderItem.getQuantity());
            orderItemRepository.save(orderItem);
            System.out.println("   OrderItem saved: " + cartItem.getProduct().getName());
        }

        cartService.clearCart(user);
        System.out.println("✅ Cart cleared for user: " + user.getId());

        // Add money to SHOP WALLET
        try {
            System.out.println("===== CALLING CREDIT TO SHOP WALLET (Razorpay Order) =====");
            shopWalletService.creditToShopWallet(savedOrder, savedOrder.getFinalAmount());
            System.out.println("✅✅✅ Money added to SHOP wallet: ₹" + savedOrder.getFinalAmount());
            System.out.println("   Shop ID: " + store.getId());
            System.out.println("   Shop Name: " + store.getStoreName());
        } catch (Exception e) {
            System.err.println("❌❌❌ CRITICAL: Failed to add money to shop wallet: " + e.getMessage());
            e.printStackTrace();
        }

        return savedOrder;
    }

    // ===============================
    // GET ALL ORDERS
    // ===============================
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        for (Order order : orders) {
            Hibernate.initialize(order.getItems());
            for (OrderItem item : order.getItems()) {
                Hibernate.initialize(item.getProduct());
            }
        }
        return orders;
    }

    // ===============================
    // GET ORDER BY ORDER NUMBER
    // ===============================
    @Transactional(readOnly = true)
    public Order getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found with order number: " + orderNumber));
        Hibernate.initialize(order.getItems());
        for (OrderItem item : order.getItems()) {
            Hibernate.initialize(item.getProduct());
        }
        return order;
    }

    // ===============================
    // PLACE ORDER (WALLET PAYMENT)
    // ===============================
    @Transactional
    public Order placeOrder(User user, OrderRequest request) {

        System.out.println("===== 📝 INSIDE placeOrder =====");
        System.out.println("User ID: " + user.getId());
        System.out.println("Payment Method: " + request.getPaymentMethod());

        List<Cart> cartItems = cartService.getCartByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Cart firstCartItem = cartItems.get(0);
        if (firstCartItem.getProduct() == null) {
            throw new RuntimeException("Product not found in cart");
        }

        Long productId = firstCartItem.getProduct().getId();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (product.getGroceryShop() == null) {
            throw new RuntimeException("Store is not assigned to this product. Please contact support.");
        }

        GroceryStore store = product.getGroceryShop();
        System.out.println("Store ID: " + store.getId());
        System.out.println("Store Name: " + store.getStoreName());

        double subtotal = cartItems.stream()
                .mapToDouble(item -> item.getProduct().getPrice().doubleValue() * item.getQuantity()).sum();

        double finalAmount = subtotal;
        System.out.println("Final Amount: ₹" + finalAmount);

        // Debit from CUSTOMER WALLET
        if (request.getPaymentMethod() == Order.PaymentMethod.WALLET) {
            if (!walletService.hasSufficientBalance(user.getId(), finalAmount)) {
                throw new RuntimeException("Insufficient wallet balance. Please add money to wallet.");
            }
            walletService.debitFromWallet(user.getId(), finalAmount, "Order payment");
            System.out.println("✅ Debited ₹" + finalAmount + " from CUSTOMER wallet (User ID: " + user.getId() + ")");
        }

        // Create ORDER
        Order order = new Order();
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUser(user);
        order.setStore(store);
        order.setSubtotal(subtotal);
        order.setFinalAmount(finalAmount);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(Order.PaymentStatus.SUCCESS);
        order.setOrderStatus(Order.OrderStatus.PENDING);
        order.setDeliveryNotes(request.getDeliveryNotes());
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // ✅ Set Address
        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId()).orElse(null);
            if (address != null) {
                order.setAddress(address);
                System.out.println("✅ Address set for order: " + address.getAddressLine1());
            }
        }

        Order savedOrder = orderRepository.save(order);
        System.out.println("✅ Order saved with ID: " + savedOrder.getId());

        // Save Order Items
        for (Cart cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice().doubleValue());
            orderItem.setTotal(orderItem.getPrice() * orderItem.getQuantity());
            orderItemRepository.save(orderItem);
            System.out.println("   OrderItem saved: " + cartItem.getProduct().getName());
        }

        // Credit to SHOP WALLET
        try {
            System.out.println("===== CALLING CREDIT TO SHOP WALLET =====");
            System.out.println("Order ID: " + savedOrder.getId());
            System.out.println("Amount: ₹" + savedOrder.getFinalAmount());
            System.out.println("Shop ID: " + store.getId());

            shopWalletService.creditToShopWallet(savedOrder, savedOrder.getFinalAmount());

            System.out.println("✅✅✅ SUCCESS: Money added to SHOP wallet: ₹" + savedOrder.getFinalAmount());

            Double shopBalance = shopWalletService.getBalanceByShopId(store.getId());
            System.out.println("Shop wallet balance after credit: ₹" + shopBalance);

        } catch (Exception e) {
            System.err.println("❌❌❌ CRITICAL ERROR: Failed to credit shop wallet: " + e.getMessage());
            e.printStackTrace();
        }

        // Clear CART
        cartService.clearCart(user);
        System.out.println("✅ Cart cleared for user: " + user.getId());
        System.out.println("===== ✅ ORDER PLACED SUCCESSFULLY =====");

        return savedOrder;
    }

    // ===============================
    // GET ORDERS BY USER
    // ===============================
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(User user) {
        List<Order> orders = orderRepository.findByUser(user);
        for (Order order : orders) {
            Hibernate.initialize(order.getItems());
            for (OrderItem item : order.getItems()) {
                Hibernate.initialize(item.getProduct());
            }
        }
        return orders;
    }

    // ===============================
    // GET ORDERS BY STORE
    // ===============================
    @Transactional(readOnly = true)
    public List<Order> getOrdersByStore(Long storeId) {
        List<Order> orders = orderRepository.findByStoreId(storeId);
        for (Order order : orders) {
            Hibernate.initialize(order.getItems());
            for (OrderItem item : order.getItems()) {
                Hibernate.initialize(item.getProduct());
            }
        }
        return orders;
    }

    // ===============================
    // GET ORDERS BY DELIVERY PERSON
    // ===============================
    @Transactional(readOnly = true)
    public List<Order> getOrdersByDeliveryPerson(User deliveryPerson) {
        List<Order> orders = orderRepository.findByDeliveryPerson(deliveryPerson);
        for (Order order : orders) {
            Hibernate.initialize(order.getItems());
            for (OrderItem item : order.getItems()) {
                Hibernate.initialize(item.getProduct());
            }
        }
        return orders;
    }

    // ===============================
    // GET ORDER BY ID
    // ===============================
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        Hibernate.initialize(order.getItems());
        for (OrderItem item : order.getItems()) {
            Hibernate.initialize(item.getProduct());
        }
        return order;
    }

    // ===============================
    // UPDATE ORDER STATUS
    // ===============================
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {

        Order order = getOrderById(orderId);
        Order.OrderStatus oldStatus = order.getOrderStatus();

        // Update status
        order.setOrderStatus(status);
        order.setUpdatedAt(LocalDateTime.now());

        // If delivered
        if (status == Order.OrderStatus.DELIVERED && oldStatus != Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());

            try {
                shopWalletService.creditToShopWallet(order, order.getFinalAmount());
                System.out.println("✅ Money added to shop wallet on delivery: ₹" + order.getFinalAmount());
            } catch (Exception e) {
                System.err.println("❌ Failed to add money to shop wallet on delivery: " + e.getMessage());
            }
        }

        return orderRepository.save(order);
    }

    // ===============================
    // ASSIGN DELIVERY PERSON
    // ===============================
    @Transactional
    public Order assignDeliveryPerson(Long orderId, User deliveryPerson) {
        Order order = getOrderById(orderId);
        order.setDeliveryPerson(deliveryPerson);
        order.setOrderStatus(Order.OrderStatus.ASSIGNED);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    // ===============================
    // CANCEL ORDER
    // ===============================
    @Transactional
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = getOrderById(orderId);

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot cancel this order");
        }

        if (order.getOrderStatus() != Order.OrderStatus.PENDING
                && order.getOrderStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order cannot be cancelled at this stage");
        }

        order.setOrderStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());

        if (order.getPaymentMethod() == Order.PaymentMethod.WALLET) {
            walletService.creditToWallet(userId, order.getFinalAmount(), "Order cancellation refund");
            System.out.println("✅ Refunded ₹" + order.getFinalAmount() + " to customer wallet");
        }

        return orderRepository.save(order);
    }

    // ===============================
    // GET ORDERS BY STATUS
    // ===============================
    @Transactional(readOnly = true)
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        List<Order> orders = orderRepository.findByOrderStatus(status);
        for (Order order : orders) {
            Hibernate.initialize(order.getItems());
            for (OrderItem item : order.getItems()) {
                Hibernate.initialize(item.getProduct());
            }
        }
        return orders;
    }
}