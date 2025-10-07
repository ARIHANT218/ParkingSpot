const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();


const connectDB = async () => {
    try{
        const connect = mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB IS CONNECTED");
    }
    catch (error){
        console.log("MONGODB IS NOT CONNECTED", error);
    }

};
module.exports = connectDB;