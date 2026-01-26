const organizationDb = require("../db/mongo/organization.db");
const organizationCredentialsDb = require("../db/mongo/organizationCredentials.mongo");
const CustomError = require("../errors/customError");
const responseUtil = require("../utils/response.util");
const organizationValidation = require("../validations/orginization.validation");
const uuidUtils = require("../utils/uuid.util");
const mailUtil = require("../utils/mail.util");
const jwt = require("jsonwebtoken");
const constantUtils = require("../utils/constant.utils");
const envUtil = require("../utils/env.util");
const e = require("express");

exports.create = async (req, res) => {
    const validation = organizationValidation.createBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { name, description, logoUrl, emailId } = req.body;
    const isNameAlreadyExist = await organizationDb.findOne({ emailId: emailId });

    if (isNameAlreadyExist) {
        throw new CustomError({
            message: "email already exist",
            statusCode: 400
        })
    }

    const password = uuidUtils.getRandomId();

    await organizationDb.create({
        name: name,
        emailId: emailId,
        description: description,
        logoUrl: logoUrl,
        secretKey: uuidUtils.getRandomId(),
        password: password
    })

    mailUtil.sendOrganizationPassword(emailId, password);

    return res.status(201).json(responseUtil.success({
        message: "organization crate successfully",
        data: null
    }))

}

exports.addCredentials = async (req, res) => {
    const validation = organizationValidation.addCredentialBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { organizationId,
        emailUserName,
        emailPassword,
        emailRateLimit,
        notificationSendPercent } = req.body;

    const totalPercent = Object.values(notificationSendPercent)
        .reduce((acc, value) => acc + value, 0);
    if (totalPercent > 100) {
        throw new CustomError({
            message: "Total notification send percent between 0 to 100",
            statusCode: 400
        })
    }

    const isOrganizatonExist = await organizationDb.findById(organizationId);
    if (isOrganizatonExist === null) {
        throw new CustomError({
            message: "organization not found",
            statusCode: 400
        })
    }

    const isCredentialAlreadyExist = await organizationCredentialsDb
        .findOne({ organizationId: organizationId, emailUserName: emailUserName });

    if (isCredentialAlreadyExist) {
        throw new CustomError({
            message: "Credential already exist",
            statusCode: 400
        })
    }

    await organizationCredentialsDb.create(
        {
            organizationId: organizationId,
            emailUserName: emailUserName,
            emailPassword: emailPassword,
            emailRateLimit: emailRateLimit,
            notificationSendPercent: notificationSendPercent
        }
    )

    return res.status(201).json(responseUtil.success({
        message: "Credential successfully",
        data: null
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

    if (organizationDbRes === null || organizationDbRes.password !== password) {
        throw new CustomError({
            message: "Invalid emailId or password",
            statusCode: 401
        })
    }

    const token = jwt.sign({
        organizationId: organizationDbRes._id,
        role: constantUtils.keys.roles.organization
    }, envUtil.JWT_SECRET_KEY, { expiresIn: '7d' });

    if(!token){
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
            organizationId: organizationDbRes._id,
            name: organizationDbRes.name,
            emailId: organizationDbRes.emailId,
            token: token,
        }
    }))
}   