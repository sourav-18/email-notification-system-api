const joi=require("joi");
const constantValidation=require("./constant.validation");

exports.createBody=joi.object({
    name:constantValidation.longString().required(),
    description:constantValidation.longString(1,1000).required(),
    logoUrl:constantValidation.uri.required()
})