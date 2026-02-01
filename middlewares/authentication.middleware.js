const CustomError = require("../errors/customError");
const envUtil = require("../utils/env.util");
const jwt = require("jsonwebtoken");
const constantUtil = require("../utils/constant.utils");
const organizationDb = require("../db/mongo/organization.db");

exports.checkAppId = (req, res, next) => {
    const appId = req.headers['app-id'];
    if (!appId) {
        throw new CustomError({
            message: "app-id is required",
            statusCode: 400
        })
    }

    if (appId != envUtil.SERVER_APP_ID) {
        throw new CustomError({
            message: "Invalid app-id",
            statusCode: 400
        })
    }

    next();
}

exports.checkTokenFoAdmin = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        throw new CustomError({
            message: "Token not found",
            statusCode: 400
        })
    }

    token = token.replace("Bearer ", "");
    if (token.length === 0) {
        throw new CustomError({
            message: "Invalid token",
            statusCode: 400
        })
    }

    jwt.verify(token, envUtil.JWT_SECRET_KEY, (err, decoded) => {
        if (err || decoded.role != constantUtil.keys.roles.admin) {
            throw new CustomError({
                message: "Invalid token",
                statusCode: 400
            })
        }
        req.headers.id = decoded.id;
        req.headers.role = decoded.role;
        next();
    });


}

exports.checkTokenForOrganization = async(req, res, next) => {
    let token = req.headers['authorization'];
    let secretKey = req.headers['secret-key'];

    if (!secretKey) {
        throw new CustomError({
            message: "secret-key is required",
            statusCode: 400
        })
    }

    if (!token) {
        throw new CustomError({
            message: "Token not found",
            statusCode: 400
        })
    }

    token = token.replace("Bearer ", "");
    if (token.length === 0) {
        throw new CustomError({
            message: "Invalid token",
            statusCode: 400
        })
    }

    await jwt.verify(token, envUtil.JWT_SECRET_KEY, async(err, decoded) => {
        if (err || decoded.role != constantUtil.keys.roles.organization) {
            throw new CustomError({
                message: "Invalid token",
                statusCode: 400
            })
        }
        const isSecretKeyValid = await organizationDb.findOne({ _id: decoded.id, secretKey: secretKey }).select({ _id: 1 });
        if (!isSecretKeyValid) {
            throw new CustomError({
                message: "Invalid secret-key",
                statusCode: 400
            })
        }


        req.headers.id = decoded.id;
        req.headers.role = decoded.role;
        next();
    });


}