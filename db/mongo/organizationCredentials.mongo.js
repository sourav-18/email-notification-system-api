const mongoose = require('mongoose');
const conn = require("./conn.mongo");
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
    organizationId: { type: mongoose.Types.ObjectId, ref: "Organizations", index: true, required: true },
    emailUserName: { type: String, required: true },
    emailPassword: { type: String, required: true },
    emailRateLimit: { type: Number, required: true, default: 0 },
    status: {
        type: Number,
        enum: [...Object.values(dbConstants.organizationCredentials.status)],
        required: true
    },
    notificationSendPercent: {
        imidiate: {
            type: Number,
            default: 0
        },
        faild: {
            type: Number,
            default: 0
        }
    }
}, 
{
    timestamps:true
}
);

module.exports = mongoose.model("organization-credentials", db);