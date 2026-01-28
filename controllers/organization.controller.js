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
const bcryptUtil = require("../utils/bcrypt.util");

exports.addCredentials = async (req, res) => {
    const validation = organizationValidation.addCredentialBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }
    const organizationId = req.headers.id;
    const { emailUserName,
        emailPassword,
        emailRateLimit,
        notificationSendPercent } = req.body;

    const totalPercent = Object.values(notificationSendPercent)
        .reduce((acc, value) => acc + Number(value), 0);
    if (totalPercent > 100) {
        throw new CustomError({
            message: "Total notification send percent between 0 to 100",
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
        message: "Credential add successfully",
        data: null
    }))
}

exports.editCredentials = async (req, res) => {
    const validation1 = organizationValidation.editCredentialBody.validate(req.body);
    const validation2 = organizationValidation.editCredentialPrams.validate(req.params);
    const validation=validation1.error?validation1:validation2;

    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }
    const organizationId = req.headers.id;
    const credentialId = req.params.credentialId;
    const {
        emailUserName,
        emailPassword,
        emailRateLimit,
        notificationSendPercent } = req.body;

    const totalPercent = Object.values(notificationSendPercent)
        .reduce((acc, value) => acc + Number(value), 0);
    if (totalPercent > 100) {
        throw new CustomError({
            message: "Total notification send percent between 0 to 100",
            statusCode: 400
        })
    }

    const isCredentialExist = await organizationCredentialsDb.findOne({_id:credentialId, organizationId:organizationId}).select({ _id: 1 });
    if (isCredentialExist === null) {
        throw new CustomError({
            message: "credential is not found",
            statusCode: 400
        })
    }

    const isCredentialAlreadyExist = await organizationCredentialsDb
        .findOne({ _id: { $ne: credentialId }, organizationId: organizationId, emailUserName: emailUserName });

    if (isCredentialAlreadyExist) {
        throw new CustomError({
            message: "Credential already exist",
            statusCode: 400
        })
    }

    const updateData = {
        organizationId: organizationId,
        emailUserName: emailUserName,
        emailRateLimit: emailRateLimit,
        notificationSendPercent: notificationSendPercent
    }
    if (emailPassword) {
        updateData.emailPassword = emailPassword
    }

    await organizationCredentialsDb.updateOne(
        { _id: credentialId },
        { $set: updateData }
    )

    return res.status(200).json(responseUtil.success({
        message: "Credential update successfully",
        data: null
    }))
}

exports.credentialList = async (req, res) => {
    const organizationId = req.headers.id;

    const credentialList = await organizationCredentialsDb.find({ organizationId: organizationId })
        .select({ _id: 1, emailUserName: 1, emailRateLimit: 1, notificationSendPercent: 1, status: 1, createdAt: 1 });

    if (credentialList.length === 0) {
        throw new CustomError({
            message: "Credential not found",
            statusCode: 404
        })
    }

    return res.status(200).json(responseUtil.success({
        message: "Credential list fetched successfully",
        data: credentialList
    }))
}

exports.credentialStatusUpdate = async (req, res) => {
    const validation = organizationValidation.credentialStatusUpdateParams.validate(req.params);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }
    const organizationId = req.headers.id;
    const credentialId = req.params.credentialId;
    const status = req.params.status;

    const updateDbRes = await organizationCredentialsDb.updateOne({ _id: credentialId, organizationId: organizationId }, {
        $set: { status: status }
    });

    if (updateDbRes.matchedCount === 0) {
        throw new CustomError({
            message: "Credential not found",
            statusCode: 404
        })
    }

    return res.status(200).json(responseUtil.success({
        message: "Credential status updated successfully",
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


exports.createByAdmin = async (req, res) => {
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
    const hashedPassword = await bcryptUtil.encryptPassword(password);

    if (!hashedPassword) {
        throw new CustomError({
            message: "Could not create organization",
            statusCode: 500
        })
    }

    await organizationDb.create({
        name: name,
        emailId: emailId,
        description: description,
        logoUrl: logoUrl,
        secretKey: uuidUtils.getRandomId(),
        password: hashedPassword
    })

    mailUtil.sendOrganizationPassword(emailId, password);

    return res.status(201).json(responseUtil.success({
        message: "organization crate successfully",
        data: null
    }))

}