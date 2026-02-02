const joi = require("joi");
const constantValidation = require("../constant.validation");
const mongDbConstant = require("../../db/mongo/constant.mongo");

exports.listQuery = joi.object({
    page: constantValidation.page,
    limit: constantValidation.limit(),
    search: constantValidation.longString(),
    sort: constantValidation.longString(),
    status: constantValidation.onlyNumber(Object.values(mongDbConstant.organization.status))
})

exports.statusUpdateParams = joi.object({
    id: constantValidation.mongodbId.required(),
    status: constantValidation.onlyNumber(Object.values(mongDbConstant.organization.status)).required(),
})
