const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const app = express();
console.log("✅ Loaded MONGODB_URI:", process.env.MONGODB_URI); // 👈 add this line

app.use(cors());
app.use(express.json());
app.use('/api/admin', require('./routes/adminRoutes'));

// Connect to DB

app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.get('/', (req, res) => {
  res.send('Smart Parking App API is running');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT}`);
  connectDB(); // ✅ now it's a proper function
});