# Online Grocery Shopping System

A complete full-stack e-commerce platform for online grocery shopping with delivery rating system, product reviews, and Razorpay payment integration.

---

## Technologies Used

**Backend:** Java 17, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA, Hibernate, MySQL, Maven

**Frontend:** React 18, Tailwind CSS, Framer Motion, Lucide Icons, Axios, React Router DOM

**APIs:** Razorpay Payment Gateway, Google Maps API

---

## Key Features

### Delivery Person Rating System
- Customers rate delivery persons 1-5 stars after order delivery
- Optional comments with rating
- Delivery persons see average rating on dashboard
- Rating distribution bars (5⭐,4⭐,3⭐,2⭐,1⭐)
- One rating per order (no duplicate)

### Customer Features
- Browse products from multiple stores
- Add to cart and manage quantity
- Multiple address selection
- Checkout using Wallet or Razorpay
- Product reviews and ratings
- Track order status
- View order history with delivery ratings

### Shop Owner Features
- Register shop (admin approval)
- Manage product categories
- Manage products with images
- View and update store orders
- Assign delivery persons
- Shop wallet for payments

### Delivery Person Features
- View assigned orders
- Update delivery status
- View customer ratings and feedback
- Rating analytics dashboard
- Delivery statistics

### Admin Features
- Manage all users
- Approve/Reject shop registrations
- View all orders
- System analytics

---

## API Endpoints

### Delivery Rating
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/delivery-rating/add | Submit rating |
| GET | /api/delivery-rating/check/{orderId} | Check if rated |
| GET | /api/delivery-rating/average/{id} | Get average rating |
| GET | /api/delivery-rating/delivery-person/{id} | Get all ratings |

### Product Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reviews/add | Add product review |
| GET | /api/reviews/product/{productId} | Get product reviews |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders/user/{userId} | Customer orders |
| GET | /api/orders/delivery/{id} | Delivery orders |
| PUT | /api/orders/{id}/status | Update status |

---

## Installation

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8085
Frontend Setup
bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
Database Setup
sql
CREATE DATABASE onlinegrocerysystem;
USE onlinegrocerysystem;
SOURCE database/schema.sql;
Default Credentials
Role	Email	Password
Admin	admin@gmail.com	admin123
Shop Owner	freshmart@gmail.com	shop123
Customer	sejalkanam7@gmail.com	customer123
Delivery Person	ramu@gmail.com	delivery123

Project Structure

online-grocery-shopping-system/
├── frontend/
│   └── src/
│       ├── CustomerComponent/
│       ├── DeliveryComponent/
│       ├── ProductComponent/
│       ├── ReviewComponent/
│       └── ShopComponent/
├── backend/
│   └── src/main/java/.../
│       ├── controller/
│       ├── service/
│       ├── repository/
│       └── entity/
└── database/
    └── schema.sql


