const joi=require("joi");

exports.mongodbId = joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    "string.base": "{#key} should be text",
    "string.pattern.base": "{#key} should be valid",
    "any.required": "{#key} is required",
    "string.empty": "{#key} can not be empty",
});

exports.emailId = joi.string().email().messages({
    "string.base": "{#key} should be string",
    "any.required": "{#key} can not be empty",
    "string.email": "{#key} should be a valid email address",
})

exports.uri=joi.string().uri().messages({
    "string.base": "{#key} should be string",
    "any.required": "{#key} can not be empty",
    "string.uri": "{#key} should be a valid url",
})

exports.longString = (min ,max) => {
    if (!min) {
        min = 1;
    }
    if (!max) {
        max = 100;
    }
    return joi.string().min(min).max(max).trim().messages({
        "string.base": "{#key} should be text",
        "any.required": "{#key} is required",
        "string.empty": "{#key} can not be empty",
        "string.min": `{#key} must be at least {#limit} characters long.`,
        "string.max": `{#key} must be at max {#limit} characters long.`,
    });
}

exports.numberRange = (min ,max) => {
    if (!min&& min!==0) {
        min = 1;
    }
    if (!max) {
        max = 100;
    }
    return joi.number().min(min).max(max).messages({
        "number.base": "{#key} should be number",
        "any.required": "{#key} is required",
        "number.min": `{#key} must be at least {#limit} `,
        "number.max": `{#key} must be at max {#limit}`,
    });
}


exports.onlyNumber=(range)=>{
    return joi.number().valid(...range).messages({
        "number.base": "{#key} should be number",
        "any.required": "{#key} is required",
        "any.only": `{#key} must be one of {#valids}`,
    });
}