const CustomError = require("../../errors/customError");
const responseUtil = require("../../utils/response.util");
const notificationQueueDb = require("../../db/mongo/notificationQueue.db");
const notificationValidation = require("../../validations/notification.validation");
const utilsConstant = require("../../utils/constant.utils");
const notificationHistoryDb = require("../../db/mongo/notificationHistory.db");

exports.historyList = async (req, res) => {
    const validation = notificationValidation.listQuery.validate(req.query);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { skipNumber, limitNumber } = utilsConstant.getPaginationValues(req.query.page, req.query.limit);
    const { sort, search, credentialId, status } = req.query;
    const sortOption = {};
    const allowedSortFields = ["_id", "attemptCount", "queueEntryTime", "successTime"];
    utilsConstant.setSortOptions(sort, allowedSortFields, sortOption);

    const filterOptions = {};

    if (search) {
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            filterOptions.$or = [
                { _id: search },
                { organizationId: search },
            ];
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
    let notifications = notificationHistoryDb.find(filterOptions)
        .populate({ path: "organizationId", select: { name: 1 } })
        .skip(skipNumber).limit(limitNumber).sort(sortOption)
        .select({
            _id: 1,
            organizationId: 1,
            receiverEmailId: 1,
            subject: 1,
            attemptCount: 1,
            status: 1,
            queueEntryTime: 1,
            successTime:1,
            createdAt: 1,
        }).lean();

    const promises = await Promise.all([notifications, totalCount]);
    notifications = promises[0];
    totalCount = promises[1];



    if (notifications.length === 0) {
        throw new CustomError({
            message: "notification histories not found",
            statusCode: 404
        })
    }

    for (const item of notifications) {
        item.organizationName = item.organizationId?.name;
        delete item.organizationId;
    }


    return res.status(200).json(responseUtil.success({
        message: "notification fetched successfully",
        data: {
            items: notifications,
            totalCount: totalCount
        }
    }))

}

exports.queueList = async (req, res) => {
    const validation = notificationValidation.listQuery.validate(req.query);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { skipNumber, limitNumber } = utilsConstant.getPaginationValues(req.query.page, req.query.limit);
    const { sort, search, credentialId, status } = req.query;
    const sortOption = {};
    const allowedSortFields = ["_id", "attemptCount", "queueEntryTime", "createdAt"];
    utilsConstant.setSortOptions(sort, allowedSortFields, sortOption);

    const filterOptions = {};

    if (search) {
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            filterOptions.$or = [
                { _id: search },
                { organizationId: search },
            ];
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

    let totalCount = notificationQueueDb.countDocuments(filterOptions);
    let notifications = notificationQueueDb.find(filterOptions)
        .populate({ path: "organizationId", select: { name: 1 } })
        .skip(skipNumber).limit(limitNumber).sort(sortOption)
        .select({
            _id: 1,
            organizationId: 1,
            receiverEmailId: 1,
            subject: 1,
            attemptCount: 1,
            status: 1,
            queueEntryTime: 1,
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
        item.organizationName = item.organizationId?.name;
        delete item.organizationId;
    }


    return res.status(200).json(responseUtil.success({
        message: "Queue notification fetched successfully",
        data: {
            items: notifications,
            totalCount: totalCount
        }
    }))

}