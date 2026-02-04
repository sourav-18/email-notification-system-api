const mongoose = require('mongoose');
const conn = require("./conn.mongo");
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
    organizationId: { type: mongoose.Types.ObjectId, ref: "organizations", index: true, required: true },
    emailUserName: { type: String, required: true },
    emailPassword: { type: String, required: true },
    emailRateLimit: { type: Number, required: true, default: 0 },
    updatedBy: { type: mongoose.Types.ObjectId, ref: "admins" },
    status: {
        type: Number,
        enum: [...Object.values(dbConstants.organizationCredentials.status)],
        default: dbConstants.organizationCredentials.status.active,
        required: true
    },
    notificationSendPercent: {
        immediate: {
            type: Number,
            default: 0
        },
        failed: {
            type: Number,
            default: 0
        }
    }
},
    {
        timestamps: {
            currentTime: () => new Date().getTime() + 5.5 * 60 * 60 * 1000,
        }
    }
);

module.exports = mongoose.model("organization-credentials", db);