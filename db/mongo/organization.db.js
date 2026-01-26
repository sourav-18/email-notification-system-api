const mongoose = require('mongoose');
const conn = require("./conn.mongo");

const db = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    logoUrl: { type: String, required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model("organizations", db);
