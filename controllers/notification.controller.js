const CustomError = require("../errors/customError");
const organizationCredentialDb = require("../db/mongo/organizationCredentials.mongo");
const mongoDbConstant = require("../db/mongo/constant.mongo");
const responseUtil = require("../utils/response.util");
const notificationQueueDb = require("../db/mongo/notificationQueue.db");
const notificationValidation = require("../validations/notification.validation");
const utilsConstant = require("../utils/constant.utils");

exports.send = async (req, res) => {
    const validation = notificationValidation.sendBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { organizationCredentialId, to: receiverEmailId, subject, text,priority,scheduleTime } = req.body;

    const organizationCredentialDbRes = await organizationCredentialDb
        .findOne({
            _id: organizationCredentialId,
            status: mongoDbConstant.organizationCredentials.status.active,
        })
        .select({ organizationId: 1, emailUserName: 1, emailPassword: 1 });

    if (organizationCredentialDbRes === null) {
        throw new CustomError({
            message: "organization not found or organization credential not set",
            statusCode: 404
        })
    }

    await notificationQueueDb.create({
        organizationId: organizationCredentialDbRes.organizationId,
        organizationCredentialId: organizationCredentialId,
        receiverEmailId: receiverEmailId,
        subject: subject,
        text: text,
        priority: priority,
        scheduleTime:scheduleTime
    });

    return res.status(202).json(responseUtil.success({
        message: "mail send initiated successfully",
        data: null
    }))

};

exports.list = async (req, res) => {
    const validation = notificationValidation.listQuery.validate(req.query);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }
    const organizationId = req.headers.id;
    const { skipNumber, limitNumber } = utilsConstant.getPaginationValues(req.query.page, req.query.limit);
    const { sort, search, credentialId } = req.query;
    const sortOption = {};
    const allowedSortFields = ["_id", "attemptCount", "queueEntryTime", "successTime"];
    utilsConstant.setSortOptions(sort, allowedSortFields, sortOption);

    const filterOptions = { organizationId: organizationId };

    if (search) {
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            filterOptions._id = search;
        } else {
            filterOptions.$or = [
                { receiverEmailId: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { text: { $regex: search, $options: 'i' } }
            ];
        }
    }

    if (credentialId) {
        filterOptions.organizationCredentialId = credentialId;
    }

    let totalCount = notificationQueueDb.countDocuments(filterOptions);
    let notifications = notificationQueueDb.find(filterOptions)
        .skip(skipNumber).limit(limitNumber).sort(sortOption)
        .select({
            _id: 1,
            receiverEmailId: 1,
            subject: 1,
            attemptCount: 1,
            priority: 1,
            status: 1,
            queueEntryTime: 1,
            successTime: 1,
            createdAt: 1,
        }).lean();

    const promises = await Promise.all([notifications, totalCount]);
    notifications = promises[0];
    totalCount = promises[1];

    if (notifications.length === 0) {
        throw new CustomError({
            message: "Queue notification histories not found",
            statusCode: 404
        })
    }

    for (const item of notifications) {
        item.queueEntryTime = item.createdAt;
        delete item.createdAt;
    }



return res.status(200).json(responseUtil.success({
    message: "Queue notification fetched successfully",
    data: {
        items: notifications,
        totalCount: totalCount
    }
}))

}

exports.detailsById = async (req, res) => {
    const validation = notificationValidation.detailsByIdParams.validate(req.params);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }
    const organizationId = req.headers.id;
    const notification = await notificationQueueDb.findOne({ _id: req.params.id, organizationId: organizationId })
        .populate({ path: "organizationCredentialId", select: { emailUserName: 1 } })
        .select({
            _id: 1,
            receiverEmailId: 1,
            subject: 1,
            text: 1,
            attemptCount: 1,
            status: 1,
            organizationCredentialId: 1,
            emailErrorMessage: 1,
            successTime: 1,
            createdAt: 1
        }).lean()

    if (notification == null) {
        throw new CustomError({
            message: "Queue notification not found",
            statusCode: 404
        })
    }

    if (notification.organizationCredentialId) {
        notification.from = notification.organizationCredentialId.emailUserName;
        delete notification.organizationCredentialId;
    }
    notification.queueEntryTime = notification.createdAt;
    delete notification.createdAt;

    return res.status(200).json(responseUtil.success({
        message: "Queue notification details fetched successfully",
        data: notification
    }))
}
