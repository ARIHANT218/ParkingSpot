# 🚗 Smart Parking App (MERN Stack)

A full-stack web application that enables users to **search, compare, and book parking spots in real time**.  
It provides a seamless experience for both users and admins — from reserving a parking spot to managing parking lots efficiently.

---

## 📘 Overview

The **Smart Parking App** makes parking **simpler, faster, and smarter** by connecting drivers with nearby parking spaces and allowing them to **book in advance**.  
Admins can efficiently manage parking lots, monitor bookings, and view availability through an intuitive interface.

---

## 🖼️ App Preview

| ![App Image 1](https://github.com/user-attachments/assets/bca57e72-ccc7-4171-b4df-faf76460aa55) | ![App Image 2](https://github.com/user-attachments/assets/13f1feba-f6f8-40a8-b283-b1b7ccb4c352) |
|:--:|:--:|
| ![App Image 3](https://github.com/user-attachments/assets/91fc148b-49a2-45ff-8e79-dfbf253e090a) | ![App Image 4](https://github.com/user-attachments/assets/42077bf3-7e04-43fd-ab37-96fd7b3bd3cb) |
| ![App Image 5](https://github.com/user-attachments/assets/824215dd-7505-4423-b7e8-fc991b3c2a3d) |  |

---


🧭 How It Works

User registers/logs in using JWT authentication.

Search for nearby parking lots by entering the city name or using the map.

View details such as price, location, and availability.

Book a parking spot for a specific time duration.

A QR code is generated for contactless entry.

Users can chat with admin, cancel bookings, or leave reviews.

Admins can manage parking data and monitor real-time bookings.

-------------------------------
## 🧩 Features

### 👥 User Features
- 🔐 Register / Login using **JWT Authentication**
- 📍 Search for nearby parking lots by city name or map
- 💰 View parking prices, ratings, and amenities
- 📅 Reserve parking for specific time slots
- 💬 Real-time chat with admin
- 🧾 View active and past bookings
- 🎟️ Access **QR code** for contactless entry
- ✏️ Edit or cancel bookings
- ⭐ Add reviews and ratings

### 🧑‍💼 Admin Features
- 🏢 Manage parking lots (CRUD operations)
- 💸 Update availability and pricing
- 📊 View all bookings and user activity logs

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JSON Web Token (JWT), bcrypt.js |
| **Utilities** | QR Code generation (`qrcode`), dotenv, CORS |

---

## 📁 Project Structure



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
## 🧑‍💻 Author

**Arihant Jain**
Full-Stack Developer | AI & ML Enthusiasts 







