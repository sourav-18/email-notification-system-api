const mongoose = require('mongoose');
const conn = require("./conn.mongo");

const db = new mongoose.Schema({
        name: {type: String, required: true},
        description: {type: String, required: true},
        logoUrl: {type: String, required: true},
    }, {
        timestamps: {
            currentTime: () => new Date().getTime() + 5.5 * 60 * 60 * 1000,
        }
    }
);

module.exports=conn.model("organizations",db);
