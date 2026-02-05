const organizationDb = require("../db/mongo/organization.db");
const CustomError = require("../errors/customError");
const responseUtil = require("../utils/response.util");
const organizationValidation = require("../validations/organization.validation");
const jwt = require("jsonwebtoken");
const constantUtils = require("../utils/constant.utils");
const envUtil = require("../utils/env.util");
const bcryptUtil = require("../utils/bcrypt.util");
const uuidUtils = require("../utils/uuid.util");
const serverEnvUtil = require("../utils/env.util");
const mailUtil=require("../utils/mail.util");

exports.create = async (req, res) => {
    const validation = organizationValidation.createBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { name, emailId, password } = req.body;
    const isNameAlreadyExist = await organizationDb.findOne({ emailId: emailId });

    if (isNameAlreadyExist) {
        throw new CustomError({
            message: "email already exist",
            statusCode: 400
        })
    }

    const hashedPassword = await bcryptUtil.encryptPassword(password);

    if (!hashedPassword) {
        throw new CustomError({
            message: "Could not create organization",
            statusCode: 500
        })
    }

    const organizationDbRes = await organizationDb.create({
        name: name,
        emailId: emailId,
        secretKey: uuidUtils.getRandomId(),
        password: hashedPassword
    })

    const token = jwt.sign({
        id: organizationDbRes._id,
        role: constantUtils.keys.roles.organization
    }, envUtil.JWT_SECRET_KEY, { expiresIn: envUtil.JWT_EXPIRE_IN });

    if (!token) {
        throw new CustomError({
            message: "Could not generate token",
            statusCode: 500
        })
    }

    return res.status(201).json(responseUtil.success({
        message: "organization crate successfully",
        data: {
            id: organizationDbRes._id,
            name: organizationDbRes.name,
            emailId: organizationDbRes.emailId,
            secretKey: organizationDbRes.secretKey,
            token: token
        }
    }))

}

exports.profileDetails = async (req, res) => {
    const organization = await organizationDb.findById(req.headers.id).select({ _id: 1, name: 1, emailId: 1,secretKey:1 }).lean();
    if (organization === null) {
        throw new CustomError({
            message: "organization not found",
            statusCode: 404
        })
    }

    return res.status(200).json(responseUtil.success({
        message: "Profile Details fetch successfully",
        data: {
            id: organization._id,
            name: organization.name,
            emailId: organization.emailId,
            secretKey: organization.secretKey,
        }
    }))
}

exports.login = async (req, res) => {

    const validation = organizationValidation.login.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { emailId, password } = req.body;

    const organizationDbRes = await organizationDb.findOne({ emailId: emailId })
        .select({ _id: 1, name: 1, emailId: 1, password: 1, logoUrl: 1, secretKey: 1 });

    if (organizationDbRes === null || await bcryptUtil.comparePassword(password, organizationDbRes.password) === false) {
        throw new CustomError({
            message: "Invalid emailId or password",
            statusCode: 401
        })
    }

    const token = jwt.sign({
        id: organizationDbRes._id,
        role: constantUtils.keys.roles.organization
    }, envUtil.JWT_SECRET_KEY, { expiresIn: envUtil.JWT_EXPIRE_IN });

    if (!token) {
        throw new CustomError({
            message: "Could not generate token",
            statusCode: 500
        })
    }

    await organizationDb.updateOne({ _id: organizationDbRes._id }, {
        $set: { lastLoginTime: Date.now() }
    });

    return res.status(200).json(responseUtil.success({
        message: "Login successful",
        data: {
            id: organizationDbRes._id,
            name: organizationDbRes.name,
            emailId: organizationDbRes.emailId,
            secretKey: organizationDbRes.secretKey,
            token: token,
        }
    }))
}
