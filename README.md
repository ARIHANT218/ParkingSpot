
# 🚗 Smart Parking App (MERN Stack)

This project allows users to **search, compare, and book parking spots** in real-time, view parking details, make reservations, and access QR codes for contactless entry.

---

## 📘 Overview

The goal of this project is to make parking **easier, faster, and smarter** by connecting drivers with nearby parking lots and allowing them to **reserve** a space in advance.
Admins can manage parking spaces, monitor availability, and view bookings.

---
 IMG ..
 ADMIN DASHBOARD ..
 ![WhatsApp Image 2025-10-16 at 20 34 55_2e29f31d](https://github.com/user-attachments/assets/7fee8506-3c1f-47d0-9e1b-2ec7ba1ce938)

<img width="982" height="390" alt="image" src="https://github.com/user-attachments/assets/1e909f45-b213-4ab1-b47e-5017bd68bf4f" />


-------

USER DASHBOARD ..
<img width="836" height="400" alt="image" src="https://github.com/user-attachments/assets/f487cc61-87cb-4732-8fd0-d7852b4e4005" />
<img width="848" height="398" alt="image" src="https://github.com/user-attachments/assets/ccc49ac5-ec21-45bd-9ff5-e65a9fa93f04" />




## 🧩 Features

### 👥 User Features

* Register / Login using JWT authentication
* Search for nearby parking lots using map or city name
* View parking prices, ratings, and amenities
* Reserve parking for specific time slots
* View active and past bookings
* Get QR code for entry
* Edit or cancel Booking parking
* Add reviews and ratings

### 🧑‍💼 Admin Features

* Manage parking lots (CRUD operations)
* Update parking availability and pricing
* View all bookings and user activities

---

## 🏗️ Tech Stack

**Frontend:** React.js, Tailwind CSS, Axios
**Backend:** Node.js, Express.js
**Database:** MongoDB (Mongoose ODM)
**Authentication:** JSON Web Token (JWT), bcrypt.js
**Other Tools:**

* QR Code generation (using `qrcode` npm package)
* CORS for API security
* dotenv for environment configuration

---

## 📁 Project Structure

```
parking-app-backend/
│
├── server.js                # Entry point
├── package.json
├── config/
│   └── db.js                # MongoDB connection
│
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── ParkingLot.js
│   ├── Booking.js
│   └── Review.js
│
├── routes/                  # API routes
│   ├── userRoutes.js
│   ├── parkingRoutes.js
│   ├── bookingRoutes.js
│   └── reviewRoutes.js
│
├── controllers/             # Logic for each route
│   ├── userController.js
│   ├── parkingController.js
│   ├── bookingController.js
│   └── reviewController.js
│
├── middleware/
│   └── authMiddleware.js    # JWT authentication
│
└── utils/
    └── generateQR.js        # QR code generator
```

---

## 🧠 API Endpoints

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| POST   | `/api/users/register`        | Register a new user           |
| POST   | `/api/users/login`           | Login user and get token      |
| GET    | `/api/parking`               | Get all parking lots          |
| GET    | `/api/parking/:id`           | Get parking lot details       |
| POST   | `/api/bookings`              | Create a booking              |
| GET    | `/api/bookings/:id`          | Get booking details (with QR) |
| PATCH  | `/api/bookings/:id/cancel`   | Cancel a booking              |
| POST   | `/api/reviews/:parkingLotId` | Add review and rating         |

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/ARIHANT218/smart-parking-app.git
cd smart-parking-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Run the server

```bash
npm start
```

Server will run at **[http://localhost:5000](http://localhost:5000)**

---

## 🚧 Future Enhancements

* Real-time availability using IoT sensors or cameras
* Payment gateway integration (Stripe / Razorpay / Paytm)
* Live map tracking with Google Maps API
* Dynamic pricing system based on demand
* Admin dashboard with analytics and revenue tracker.
---

## 🧑‍💻 Author

**Arihant Jain**
Full-Stack Developer | AI & ML Enthusiasts 



