const notificationQueueDb = require("../db/mongo/notificationQueue.db");
const notificationHistoryDb = require("../db/mongo/notificationHistory.db");
const mongoDbConstant = require("../db/mongo/constant.mongo");

exports.saveSuccessNotificationFromQueue = async () => {
    try {
        const histories = await notificationQueueDb.find({ status: mongoDbConstant.notificationQueue.status.success }).select({
            organizationId: 1,
            organizationCredentialId:1,
            receiverEmailId: 1,
            subject: 1,
            text: 1,
            attemptCount: 1,
            priority: 1,
            status: 1,
            successTime: 1,
            createdAt: 1
        }).limit(100).lean();

        const notificationIds = histories.map(item => item._id);

        for (const history of histories) {
            history.queueEntryTime = history.createdAt;
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
             status: mongoDbConstant.notificationQueue.status.attempt,
             attemptCount:{$gt:4} 
            }).select({
            organizationId: 1,
            organizationCredentialId:1,
            receiverEmailId: 1,
            subject: 1,
            text: 1,
            attemptCount: 1,
            priority: 1,
            status: 1,
            successTime: 1,
            createdAt: 1
        }).limit(100).lean();

        const notificationIds = histories.map(item => item._id);

        for (const history of histories) {
            history.queueEntryTime = history.createdAt;
            history.status=mongoDbConstant.notificationQueue.status.failed
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