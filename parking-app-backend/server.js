const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.get('/', (req, res) => {
  res.send('Smart Parking App API is running');
});

app.listen(PORT, () => {
  console.log('server is running on PORT:' + PORT);
});