const organizationCredentialDb = require("../db/mongo/organizationCredentials.mongo");
const mongoDbConstant = require("../db/mongo/constant.mongo");
const mailUtil = require("../utils/mail.util");
const notificationQueueDb = require("../db/mongo/notificationQueue.db");


async function getImmediateOrgIds(status) {
    const aggregationArray = [];

    const matchPipeline = {
        $match: {
            status: status,
            priority: mongoDbConstant.notificationQueue.priority.immediate
        }
    };
    const groupPipeline = {
        $group: {
            _id: "$organizationCredentialId"
        }
    };

    aggregationArray.push(matchPipeline);
    aggregationArray.push(groupPipeline);

    const notificationQueueDbRes = await notificationQueueDb.aggregate(aggregationArray).exec();
    if (notificationQueueDbRes.length === 0) return null;
    return notificationQueueDbRes.map(item => item._id);
}

async function getScheduleOrgIds(status) {
    const aggregationArray = [];

    const matchPipeline = {
        $match: {
            status: status,
            priority: mongoDbConstant.notificationQueue.priority.schedule,
            scheduleTime: { $lte: new Date() }
        }
    };
    const groupPipeline = {
        $group: {
            _id: "$organizationCredentialId"
        }
    };

    aggregationArray.push(matchPipeline);
    aggregationArray.push(groupPipeline);

    const notificationQueueDbRes = await notificationQueueDb.aggregate(aggregationArray).exec();
    if (notificationQueueDbRes.length === 0) return null;
    return notificationQueueDbRes.map(item => item._id);
}

async function getErrorOrgIds() {
    const aggregationArray = [];

    const matchPipeline = {
        $match: {
            status: mongoDbConstant.notificationQueue.status.error,
        }
    };
    const groupPipeline = {
        $group: {
            _id: "$organizationCredentialId"
        }
    };

    aggregationArray.push(matchPipeline);
    aggregationArray.push(groupPipeline);

    const notificationQueueDbRes = await notificationQueueDb.aggregate(aggregationArray).exec();
    if (notificationQueueDbRes.length === 0) return null;
    return notificationQueueDbRes.map(item => item._id);
}

exports.sendIdealMail = async (priority) => {
    const status = mongoDbConstant.notificationQueue.status.ideal;

    let organizationCredentialIds = null;

    if (priority === mongoDbConstant.notificationQueue.priority.immediate) {
        organizationCredentialIds = await getImmediateOrgIds(status);
    } else if (priority === mongoDbConstant.notificationQueue.priority.schedule) {
        organizationCredentialIds = await getScheduleOrgIds(status);
    }

    if (organizationCredentialIds === null) return;

    for (const orgCredId of organizationCredentialIds) {
        const organizationCredentialDbRes = await organizationCredentialDb.findOne({
            _id: orgCredId,
            status: mongoDbConstant.organizationCredentials.status.active
        }).select({ emailUserName: 1, emailPassword: 1, notificationSendPercent: 1, emailRateLimit: 1 });

        if (organizationCredentialDbRes === null) return;
        let limit = (organizationCredentialDbRes.notificationSendPercent.immediate / 100) *
            organizationCredentialDbRes.emailRateLimit;

        limit = limit ? limit : 0; //for safe

        const notificationQueueDbRes = await notificationQueueDb.find({
            organizationCredentialId: orgCredId,
            priority: priority,
            status: status
        }).select({ receiverEmailId: 1, subject: 1, text: 1 })
            .sort({ _id: 1 })
            .limit(limit);

        if (notificationQueueDbRes === null || notificationQueueDbRes.length === 0) continue;

        notificationQueueDbRes.forEach(async (notification) => {
            const isIdeal = await notificationQueueDb.updateOne({ _id: notification.id, status: status }, {
                $set: {
                    status: mongoDbConstant.notificationQueue.status.processing,
                    lastAttemptTime: Date.now(),
                    queueEntryTime: Date.now(),
                },
                $inc: { attemptCount: 1 }
            }); // it insure that same notification not send twice
            if (isIdeal.matchedCount == 0) return;
            mailUtil.sendMail({
                notificationId: notification.id,
                emailUserName: organizationCredentialDbRes.emailUserName,
                emailPassword: organizationCredentialDbRes.emailPassword,
                receiverEmailId: notification.receiverEmailId,
                subject: notification.subject,
                text: notification.text
            })
        })

    }

}

exports.sendErrorMail = async () => {
    let beforeTime = new Date("2024-12-12 01:11");
    console.log(beforeTime);
    beforeTime.setHours(beforeTime.getHours() - 1);
    console.log(beforeTime);
    return;
    const status = mongoDbConstant.notificationQueue.status.error;

    const organizationCredentialIds = await getErrorOrgIds();
    if (organizationCredentialIds === null) return;

    for (const orgCredId of organizationCredentialIds) {
        const organizationCredentialDbRes = await organizationCredentialDb.findOne({
            _id: orgCredId,
            status: mongoDbConstant.organizationCredentials.status.active
        }).select({ emailUserName: 1, emailPassword: 1, notificationSendPercent: 1, emailRateLimit: 1 });

        if (organizationCredentialDbRes === null) return;
        let limit = (organizationCredentialDbRes.notificationSendPercent.failed / 100) *
            organizationCredentialDbRes.emailRateLimit;

        limit = limit ? limit : 0; //for safe


        const notificationQueueDbRes = await notificationQueueDb.find({
            organizationCredentialId: orgCredId,
            lastAttemptTime: { $lte: beforeTime },
            status: status
        }).select({ receiverEmailId: 1, subject: 1, text: 1, lastAttemptTime: 1 })
            .sort({ _id: 1 })
            .limit(limit);

        if (notificationQueueDbRes === null || notificationQueueDbRes.length === 0) continue;

        notificationQueueDbRes.forEach(async (notification) => {
            const isIdeal = await notificationQueueDb.updateOne({ _id: notification.id, status: status }, {
                $set: {
                    status: mongoDbConstant.notificationQueue.status.processing,
                    lastAttemptTime: Date.now()
                },
                $inc: { attemptCount: 1 }
            }); // it insure that same notification not send twice

            if (isIdeal.matchedCount == 0) return;

            mailUtil.sendMail({
                notificationId: notification.id,
                emailUserName: organizationCredentialDbRes.emailUserName,
                emailPassword: organizationCredentialDbRes.emailPassword,
                receiverEmailId: notification.receiverEmailId,
                subject: notification.subject,
                text: notification.text
            })
        })

    }

}

exports.updateToError = async (id, errorMessage) => {
    await notificationQueueDb.updateOne({
        _id: id
    }, {
        $set: {
            status: mongoDbConstant.notificationQueue.status.error,
            emailErrorMessage: errorMessage
        }
    })
}

exports.updateToSuccess = async (id) => {
    await notificationQueueDb.updateOne({
        _id: id
    }, {
        $set: {
            status: mongoDbConstant.notificationQueue.status.success,
            successTime: Date.now()
        }
    })
}
