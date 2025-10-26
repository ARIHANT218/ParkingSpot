
# 🚗 Smart Parking App (MERN Stack)

This project allows users to **search, compare, and book parking spots** in real-time, view parking details, make reservations, and access QR codes for contactless entry.

---

## 📘 Overview

The goal of this project is to make parking **easier, faster, and smarter** by connecting drivers with nearby parking lots and allowing them to **reserve** a space in advance.
Admins can manage parking spaces, monitor availability, and view bookings.

---
 IMG ..

![WhatsApp Image 2025-10-22 at 20 46 34_2172b983](https://github.com/user-attachments/assets/bca57e72-ccc7-4171-b4df-faf76460aa55)


![WhatsApp Image 2025-10-22 at 20 46 34_1b7f6002](https://github.com/user-attachments/assets/13f1feba-f6f8-40a8-b283-b1b7ccb4c352)


![WhatsApp Image 2025-10-22 at 20 46 34_dc77037d](https://github.com/user-attachments/assets/91fc148b-49a2-45ff-8e79-dfbf253e090a)

![WhatsApp Image 2025-10-22 at 20 46 34_3594d706](https://github.com/user-attachments/assets/42077bf3-7e04-43fd-ab37-96fd7b3bd3cb)
![WhatsApp Image 2025-10-22 at 20 46 34_dd94a338](https://github.com/user-attachments/assets/824215dd-7505-4423-b7e8-fc991b3c2a3d)



## 🧩 Features

### 👥 User Features

* Register / Login using JWT authentication
* Search for nearby parking lots using map or city name
* View parking prices, ratings, and amenities
* Reserve parking for specific time slots
* Real-time chat between admin and users.
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





