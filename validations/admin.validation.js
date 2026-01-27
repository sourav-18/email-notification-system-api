const joi = require("joi");
const constantValidation = require("./constant.validation");

exports.login=joi.object({
    emailId:constantValidation.emailId.required(),
    password:constantValidation.longString(4,50).required(),
})
