const joi=require("joi");
const constantValidation=require("./constant.validation");

exports.createBody=joi.object({
    name:constantValidation.longString().required(),
    description:constantValidation.longString(1,1000).required(),
    logoUrl:constantValidation.uri.required(),
    emailId:constantValidation.emailId.required(),
})

exports.addCredentialBody=joi.object({
    organizationId:constantValidation.mongodbId.required(),
    emailUserName:constantValidation.emailId.required(),
    emailPassword:constantValidation.longString(10,30).required(),
    emailRateLimit:constantValidation.numberRange(0,200).required(),
    notificationSendPercent:joi.object({
        immediate:constantValidation.numberRange(0,100).required(),
        failed:constantValidation.numberRange(0,100).required(),
    }).required()
})

exports.login=joi.object({
    emailId:constantValidation.emailId.required(),
    password:constantValidation.longString(4,50).required(),
})

