# Smart Parking App - Setup Guide

This guide will help you set up and run the Smart Parking App with all the features you requested.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd parking-app-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the `parking-app-backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/parking-app
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   The backend will run on http://localhost:5000

### 2. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

## ✨ Features Implemented

### 👥 User Features
- ✅ **Register/Login** - JWT authentication system
- ✅ **Search Parking** - Find parking lots by city
- ✅ **View Details** - See prices, ratings, amenities
- ✅ **Reserve Parking** - Book specific time slots
- ✅ **View Bookings** - See active and past bookings
- ✅ **QR Code Entry** - Get QR code for parking entry
- ✅ **Edit/Cancel** - Modify or cancel reservations
- ✅ **Reviews & Ratings** - Add reviews and rate parking lots

### 🧑‍💼 Admin Features
- ✅ **Manage Parking Lots** - Full CRUD operations
- ✅ **Update Availability** - Modify spots and pricing
- ✅ **View Activities** - Monitor bookings and user activities

## 🗂️ Project Structure

```
ParkingSpot/
├── parking-app-backend/          # Node.js/Express API
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/              # API route handlers
│   │   ├── userController.js
│   │   ├── parkingController.js
│   │   ├── bookingController.js
│   │   └── reviewController.js
│   ├── models/                   # Mongoose schemas
│   │   ├── user.js
│   │   ├── ParkingLot.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/                   # API routes
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication
│   ├── utils/
│   │   └── generateQR.js         # QR code generation
│   └── server.js                 # Express server
├── frontend/                     # React.js frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js           # API service layer
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/               # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ParkingList.jsx
│   │   │   ├── ParkingDetail.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── BookingDetail.jsx
│   │   │   ├── BookingsList.jsx
│   │   │   └── AdminDashboard.jsx
│   │   └── App.jsx              # Main app component
└── README.md
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login user and get token |
| GET | `/api/users/profile` | Get user profile |
| GET | `/api/parking` | Get all parking lots |
| GET | `/api/parking/:id` | Get parking lot details |
| POST | `/api/parking` | Create parking lot (admin) |
| PATCH | `/api/parking/:id` | Update parking lot (admin) |
| DELETE | `/api/parking/:id` | Delete parking lot (admin) |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/:id` | Get booking details (with QR) |
| GET | `/api/bookings/user/:userId` | Get user bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking |
| POST | `/api/reviews/:parkingLotId` | Add review and rating |
| GET | `/api/reviews/:parkingLotId` | Get reviews for parking lot |

## 🎯 Usage Guide

### For Users:
1. **Register/Login** - Create an account or sign in
2. **Search Parking** - Browse available parking lots
3. **View Details** - Check pricing, amenities, and reviews
4. **Book Parking** - Select time slots and confirm booking
5. **Use QR Code** - Show QR code at parking entrance
6. **Manage Bookings** - View, edit, or cancel reservations
7. **Leave Reviews** - Rate and review parking experiences

### For Admins:
1. **Access Dashboard** - Login with admin account
2. **Manage Parking Lots** - Add, edit, or delete parking locations
3. **Update Pricing** - Modify hourly rates and availability
4. **Monitor Bookings** - View all user activities and bookings

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for authentication:
- Users must register/login to book parking
- Tokens are stored in localStorage
- Protected routes require valid authentication
- Admin routes require admin role

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop and mobile
- **Modern UI** - Clean, professional interface with Tailwind CSS
- **Real-time Updates** - Dynamic availability and pricing
- **QR Code Generation** - Automatic QR codes for bookings
- **User-friendly Forms** - Intuitive booking and management forms
- **Status Indicators** - Clear booking and availability status
- **Search & Filter** - Easy parking lot discovery

## 🚧 Next Steps (Optional Enhancements)

- Payment gateway integration
- Real-time map integration
- Push notifications
- Advanced filtering options
- Parking lot photos
- Multiple payment methods
- Booking history analytics

## 🐛 Troubleshooting

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file exists with correct values
- Ensure port 5000 is available

**Frontend won't start:**
- Check if Node.js version is compatible
- Clear node_modules and reinstall dependencies
- Verify port 5173 is available

**Authentication issues:**
- Check JWT_SECRET in backend `.env`
- Verify API endpoints are accessible
- Check browser console for errors

## 📞 Support

If you encounter any issues, check:
1. All dependencies are installed
2. MongoDB is running and accessible
3. Environment variables are set correctly
4. Both frontend and backend servers are running

---

**Happy Parking! 🚗✨**
