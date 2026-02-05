const mongoose = require('mongoose');
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
        organizationId: {type: mongoose.Types.ObjectId, ref: "organizations", index: true, required: true},
        organizationCredentialId: {type: mongoose.Types.ObjectId, ref: "organization-credentials", index: true, required: true},
        receiverEmailId: {type: String, required: true},
        subject: {type: String, required: true},
        text: {type: String, required: true},
        attemptCount: {type: Number, required: true, default: 0,index:true},
        lastAttemptTime:{type: Date,index:true,sparse:true},
        successTime: {type: Date},
        emailErrorMessage: {type: String},
        scheduleTime:{type: Date,index:true,sparse:true},
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
            default: dbConstants.notificationQueue.status.ideal,
            index:true
        },
    }, {
        timestamps:true
    }
);

module.exports= mongoose.model("notification-queues", db);

