const mongoose = require('mongoose');
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
    organizationId: { type: mongoose.Types.ObjectId, ref: "organizations", index: true, required: true },
    emailUserName: { type: String, required: true, index: true },
    emailPassword: { type: String, required: true },
    emailRateLimit: { type: Number, required: true, default: 0 },
    updatedBy: { type: mongoose.Types.ObjectId, ref: "admins", index: true, sparse: true },
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
        timestamps: true
    }
);

module.exports = mongoose.model("organization-credentials", db);