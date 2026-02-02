const mongoose = require('mongoose');
const dbConstants = require("./constant.mongo");

const db = new mongoose.Schema({
    name: { type: String, required: true},
    emailId: { type: String, required: true,unique:true },
    password: { type: String, required: true },
    description: { type: String,default:"" },
    logoUrl: { type: String,default:"" },
    secretKey: { type: String, required: true },
    lastLoginTime: { type: Date },
    status:{type:Number,default:dbConstants.organization.status.active},
    updatedBy: {type: mongoose.Types.ObjectId, ref: "admins"}

},
    { timestamps: true }
);

module.exports = mongoose.model("organizations", db);
