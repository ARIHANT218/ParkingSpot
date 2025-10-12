const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();


app.use(express.json());
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
} 
);

