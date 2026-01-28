const joi=require("joi");
const constantValidation=require("./constant.validation");
const mongDbConstant=require("../db/mongo/constant.mongo");

exports.createBody=joi.object({
    name:constantValidation.longString().required(),
    description:constantValidation.longString(1,1000).required(),
    logoUrl:constantValidation.uri.required(),
    emailId:constantValidation.emailId.required(),
})

exports.addCredentialBody=joi.object({
    emailUserName:constantValidation.emailId.required(),
    emailPassword:constantValidation.longString(4,30).required(),
    emailRateLimit:constantValidation.numberRange(0,200).required(),
    notificationSendPercent:joi.object({
        immediate:constantValidation.numberRange(0,100).required(),
        failed:constantValidation.numberRange(0,100).required(),
    }).required()
})

exports.editCredentialBody=joi.object({
    emailUserName:constantValidation.emailId.required(),
    emailPassword:constantValidation.longString(4,30),
    emailRateLimit:constantValidation.numberRange(0,200).required(),
    notificationSendPercent:joi.object({
        immediate:constantValidation.numberRange(0,100).required(),
        failed:constantValidation.numberRange(0,100).required(),
    }).required()
})

exports.editCredentialPrams=joi.object({
    credentialId:constantValidation.mongodbId.required(),
})

exports.credentialStatusUpdateParams=joi.object({
    credentialId:constantValidation.mongodbId.required(),
    status:constantValidation.onlyNumber(Object.values(mongDbConstant.organizationCredentials.status)).required(),
})

exports.login=joi.object({
    emailId:constantValidation.emailId.required(),
    password:constantValidation.longString(4,50).required(),
})

