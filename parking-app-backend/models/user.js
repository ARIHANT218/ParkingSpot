const mongoose = require("mongoose");
// ...existing code...
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone:String,
    role:{type:String,
        enum:["user","admin"],
        default:"user",
    }
}, { timestamps: true })

// Encrypt Password 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    
});

module.exports = mongoose.model('User', userSchema);