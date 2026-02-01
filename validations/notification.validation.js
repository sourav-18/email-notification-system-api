const joi=require("joi");
const constantValidation=require("./constant.validation");
const mongDbConstant=require("../db/mongo/constant.mongo");

exports.sendBody=joi.object({
    organizationCredentialId:constantValidation.mongodbId.required(),
    to:constantValidation.emailId.required(),
    subject:constantValidation.longString(1,1000),
    text:constantValidation.longString(1,10000),
    priority:constantValidation.onlyNumber
    (Object.values(mongDbConstant.notificationQueue.priority)).required(),
    scheduleTime:constantValidation.dateTime
})

exports.listQuery=joi.object({
    page:constantValidation.page,
    limit:constantValidation.limit(),
    search:constantValidation.longString(),
    credentialId:constantValidation.mongodbId,
    sort:constantValidation.longString(),
    status:constantValidation.onlyNumber(Object.values(mongDbConstant.notificationQueue.status))
})

exports.detailsByIdParams=joi.object({
    id:constantValidation.mongodbId.required()
})

exports.cancelByIdParams=joi.object({
    id:constantValidation.mongodbId.required()
})


