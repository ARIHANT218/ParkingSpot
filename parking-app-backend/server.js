const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
  
});