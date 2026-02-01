const mongoose = require('mongoose');
const conn = require("./conn.mongo");
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
        organizationId: {type: mongoose.Types.ObjectId, ref: "organizations", index: true, required: true},
        organizationCredentialId: {type: mongoose.Types.ObjectId, ref: "organization-credentials", index: true, required: true},
        receiverEmailId: {type: String, required: true},
        subject: {type: String, required: true},
        text: {type: String, required: true},
        attemptCount: {type: Number, required: true, default: 0},
        lastAttemptTime:{type: Date},
        successTime: {type: Date},
        emailErrorMessage: {type: String},
        scheduleTime:{type: Date},
        queueEntryTime:{type: Date},
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
        timestamps:true
    }
);

module.exports= mongoose.model("notification-queues", db);

