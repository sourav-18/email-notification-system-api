const mongoose = require('mongoose');
const conn = require("./conn.mongo");
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
    organizationId: { type: mongoose.Types.ObjectId, ref: "Organizations", index: true,required:true },
    emailUserName: { type: String, required: true },
    emailPassword: { type: String, required: true },
    status: {
        type: Number,
        enum: [...Object.values(dbConstants.organizationCredentials.status)],
        required:true
    },
}, {
    timestamps: {
        currentTime: () => new Date().getTime() + 5.5 * 60 * 60 * 1000,
    }
}
);

module.exports = conn.model("organization-credentials", db);