# 🚗 Smart Parking App (MERN Stack)

A full-stack web application that enables users to **search, compare, and book parking spots in real time**.  
Provides a seamless experience for drivers and admins — from reserving a parking spot to managing parking lots and bookings.

---

## 📘 Overview

The **Smart Parking App** makes parking **simpler, faster, and smarter** by connecting drivers with nearby parking spaces and allowing them to **book in advance**.  
Admins can manage parking lots, monitor bookings, and view availability via an intuitive dashboard.

---

## 🖼️ App Preview

> Screenshots / app previews (hosted assets). Replace with local `/assets/...` files if you prefer keeping images in repo.

| Dashboard | Search / Listings |
|:--:|:--:|
| ![Dashboard screenshot](https://github.com/user-attachments/assets/efb9ce9e-fe3f-435b-85ed-4aac3069c604) | ![Search screenshot](https://github.com/user-attachments/assets/13f1feba-f6f8-40a8-b283-b1b7ccb4c352) |

| Booking / QR | Admin: Lots list |
|:--:|:--:|
| ![Booking screenshot](https://github.com/user-attachments/assets/91fc148b-49a2-45ff-8e79-dfbf253e090a) | ![Admin lots screenshot](https://github.com/user-attachments/assets/42077bf3-7e04-43fd-ab37-96fd7b3bd3cb) |

| Reviews / Misc |
|:--:|
| ![Misc screenshot](https://github.com/user-attachments/assets/824215dd-7505-4423-b7e8-fc991b3c2a3d) |

---
## 🧭 How It Works

1. **Register / Login** — users authenticate using JWT.
2. **Search** — find nearby parking lots by city or map.
3. **View details** — check price, availability, ratings, and amenities.
4. **Reserve** — choose a time slot and create a booking.
5. **QR Access** — receive a QR code for contactless entry.
6. **Manage** — users can chat with admin, cancel or edit bookings, and leave reviews.
7. **Admin control** — admins create/update parking lots, confirm bookings, and monitor activity.

---

## 🧩 Features

### 👥 User Features
- 🔐 Register / Login (JWT)
- 📍 Search by city or map
- 💰 View price, ratings, and amenities
- 📅 Reserve parking by time slot
- 💬 Real-time chat with admin
- 🧾 Active & past bookings
- 🎟️ QR code for contactless entry
- ✏️ Edit / cancel bookings
- ⭐ Reviews & ratings

### 🧑‍💼 Admin Features
- 🏢 Manage parking lots (Create / Read / Update / Delete)
- 💸 Update availability & pricing
- 📊 View all bookings and user activity
- ✅ Confirm or cancel bookings (restores slots on cancel)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JSON Web Token (JWT), bcrypt.js |
| Utilities | QR code (`qrcode`), dotenv, CORS |

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
## 🧑‍💻 Author

**Arihant Jain**
Full-Stack Developer | AI & ML Enthusiasts 










