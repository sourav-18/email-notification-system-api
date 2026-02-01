const notificationQueueDb = require("../db/mongo/notificationQueue.db");
const notificationHistoryDb = require("../db/mongo/notificationHistory.db");
const mongoDbConstant = require("../db/mongo/constant.mongo");
const utilsConstant = require("../utils/constant.utils");
const CustomError = require("../errors/customError");
const responseUtil = require("../utils/response.util");
const notificationValidation = require("../validations/notification.validation");
const constantValidation = require("../validations/constant.validation");

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
    const { sort, search, credentialId,status } = req.query;
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

    if (status) {
        filterOptions.status = status;
    }

    let totalCount = notificationHistoryDb.countDocuments(filterOptions);
    let histories = notificationHistoryDb.find(filterOptions)
        .skip(skipNumber).limit(limitNumber).sort(sortOption)
        .select({
            _id: 1,
            receiverEmailId: 1,
            subject: 1,
            attemptCount: 1,
            priority: 1,
            status: 1,
            queueEntryTime: 1,
            successTime: 1
        });

    const promises = await Promise.all([histories, totalCount]);
    histories = promises[0];
    totalCount = promises[1];

    if (histories.length === 0) {
        throw new CustomError({
            message: "Notification histories not found",
            statusCode: 404
        })
    }

    return res.status(200).json(responseUtil.success({
        message: "Notification histories fetched successfully",
        data: {
            items: histories,
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
    const notification = await notificationHistoryDb.findOne({ _id: req.params.id, organizationId: organizationId })
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
            queueEntryTime: 1,
            scheduleTime: 1,
            successTime: 1
        }).lean()

    if (notification == null) {
        throw new CustomError({
            message: "Notification histories not found",
            statusCode: 404
        })
    }

    if (notification.organizationCredentialId) {
        notification.from = notification.organizationCredentialId.emailUserName;
        delete notification.organizationCredentialId;
    }

    return res.status(200).json(responseUtil.success({
        message: "Notification histories details fetched successfully",
        data: notification
    }))
}


//cron job

exports.saveSuccessNotificationFromQueue = async () => {
    try {
        const histories = await notificationQueueDb.find({ status: mongoDbConstant.notificationQueue.status.success })
            .select(getSaveSelectFiled()).limit(100).lean();

        const notificationIds = histories.map(item => item._id);

        for (const history of histories) {
            delete history.createdAt;
            delete history._id;
        }

        await notificationHistoryDb.insertMany(histories);

        await notificationQueueDb.deleteMany({ _id: { $in: notificationIds } });

        return;

    } catch (error) {
        console.log(error);
    }

}

exports.saveFailedNotificationFromQueue = async () => {
    try {
        const histories = await notificationQueueDb.find({
            status: mongoDbConstant.notificationQueue.status.error,
            attemptCount: { $gt: 4 }
        }).select(getSaveSelectFiled()).limit(100).lean();

        const notificationIds = histories.map(item => item._id);

        for (const history of histories) {
            history.status = mongoDbConstant.notificationQueue.status.failed
            delete history.createdAt;
            delete history._id;
        }

        await notificationHistoryDb.insertMany(histories);

        await notificationQueueDb.deleteMany({ _id: { $in: notificationIds } });

        return;

    } catch (error) {
        console.log(error);
    }

}


function getSaveSelectFiled() {
    return {
        organizationId: 1,
        organizationCredentialId: 1,
        receiverEmailId: 1,
        subject: 1,
        text: 1,
        attemptCount: 1,
        priority: 1,
        status: 1,
        emailErrorMessage: 1,
        successTime: 1,
        createdAt: 1,
        scheduleTime: 1,
        queueEntryTime: 1
    }
}