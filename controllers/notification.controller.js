const CustomError = require("../errors/customError");
const organizationCredentialDb = require("../db/mongo/organizationCredentials.mongo");
const mongoDbConstant = require("../db/mongo/constant.mongo");
const responseUtil = require("../utils/response.util");
const notificationQueueDb = require("../db/mongo/notificationQueue.db");
const notificationValidation = require("../validations/notification.validation");

exports.sendImmediate = async (req, res) => {
    const validation = notificationValidation.sendImmediateBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const {organizationCredentialId, receiverEmailId, subject, text} = req.body;
    const organizationCredentialDbRes = await organizationCredentialDb
        .findOne({
            _id: organizationCredentialId,
            status: mongoDbConstant.organizationCredentials.status.active,
        })
        .select({organizationId:1,emailUserName: 1, emailPassword: 1});

    if (organizationCredentialDbRes === null) {
        throw new CustomError({
            message: "organization not found or organization credential not set",
            statusCode: 404
        })
    }

    await notificationQueueDb.create({
        organizationId:organizationCredentialDbRes.organizationId,
        organizationCredentialId: organizationCredentialId,
        receiverEmailId: receiverEmailId,
        subject: subject,
        text: text,
        priority: mongoDbConstant.notificationQueue.priority.immediate
    });

    return res.status(202).json(responseUtil.success({
        message: "mail send initiated successfully",
        data: null
    }))

};

