const mongoose = require('mongoose');
const conn = require("conn.mongo");
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
        organizationId: {type: mongoose.Types.ObjectId, ref: "Organizations",index:true},
        emailUserName: {type: String, required: true},
        emailPassword: {type: String, required: true},
        credentialType: {
            type: String,
            required: true,
            enum: [Object.values(dbConstants.organizationCredentials.credentialType)],
            index:true
        },
        status: {type: String, enum: [Object.values(dbConstants.organizationCredentials.status)]},
    }, {
        timestamps: {
            currentTime: () => new Date().getTime() + 5.5 * 60 * 60 * 1000,
        }
    }
);

module.exports = conn.model("organization-credentials", db);