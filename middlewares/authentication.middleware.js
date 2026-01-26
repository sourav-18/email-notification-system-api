const CustomError = require("../errors/customError");
const envUtil=require("../utils/env.util");

exports.checkAppId = (req, res, next) => {
    const appId = req.headers['app-id'];
    if (!appId) {
        throw new CustomError({
            message: "app-id is required",
            statusCode: 400
        })
    }

    if(appId!=envUtil.SERVER_APP_ID){
        throw new CustomError({
            message: "Invalid app-id",
            statusCode: 400
        })
    }

    next();
}