const mongoose = require('mongoose');
const conn = require("./conn.mongo");

const db = new mongoose.Schema({
    name: { type: String, required: true},
    emailId: { type: String, required: true,unique:true },
    password: { type: String, required: true },
    profilePic: { type: String, required: true },
    lastLoginTime: { type: Date },
},
    { timestamps: true }
);

module.exports = mongoose.model("admins", db);
