const joi=require("joi");
const constantValidation=require("./constant.validation");

exports.sendImmediateBody=joi.object({
    organizationCredentialId:constantValidation.mongodbId.required(),
    receiverEmailId:constantValidation.emailId.required(),
    subject:constantValidation.longString(1,1000),
    text:constantValidation.longString(1,10000),
})

exports.listQuery=joi.object({
    page:constantValidation.page,
    limit:constantValidation.limit(),
    search:constantValidation.longString(),
    credentialId:constantValidation.mongodbId,
    sort:constantValidation.longString()
})

