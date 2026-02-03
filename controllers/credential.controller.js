const organizationCredentialsDb = require("../db/mongo/organizationCredentials.mongo");
const CustomError = require("../errors/customError");
const responseUtil = require("../utils/response.util");
const organizationValidation = require("../validations/organization.validation");
const mongoDbConstant = require("../db/mongo/constant.mongo");

exports.add = async (req, res) => {
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

exports.edit = async (req, res) => {
    const validation1 = organizationValidation.editCredentialBody.validate(req.body);
    const validation2 = organizationValidation.editCredentialPrams.validate(req.params);
    const validation = validation1.error ? validation1 : validation2;

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

    const isCredentialExist = await organizationCredentialsDb.findOne({ _id: credentialId, organizationId: organizationId }).select({ _id: 1 });
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

exports.list = async (req, res) => {
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

exports.listForFilter = async (req, res) => {
    const organizationId = req.headers.id;

    const credentialList = await organizationCredentialsDb.find({
        organizationId: organizationId,
        status: mongoDbConstant.organizationCredentials.status.active
    }).select({ _id: 1, emailUserName: 1 }).lean();

    credentialList.forEach((item) => {
        item.value = item.emailUserName;
        delete item.emailUserName;
    })

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

exports.statusUpdate = async (req, res) => {
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