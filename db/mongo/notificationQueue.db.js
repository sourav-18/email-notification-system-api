const mongoose = require('mongoose');
const conn = require("./conn.mongo");
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
        organizationId: {type: mongoose.Types.ObjectId, ref: "Organizations", index: true, required: true},
        receiverEmailId: {type: String, required: true},
        subject: {type: String, required: true},
        text: {type: String, required: true},
        attemptCount: {type: Number, required: true, default: 0},
        priority: {
            type: Number,
            required: true,
            enum: [...Object.values(dbConstants.notificationQueue.priority)],
            index: true
        },
        status: {
            type: Number,
            required: true,
            enum: [...Object.values(dbConstants.notificationQueue.status)],
            default: dbConstants.notificationQueue.status.ideal
        },
    }, {
        timestamps: {
            currentTime: () => new Date().getTime() + 5.5 * 60 * 60 * 1000,
        }
    }
);

module.exports = conn.model("notification-queue", db);
