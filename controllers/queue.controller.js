const organizationCredentialDb = require("../db/mongo/organizationCredentials.mongo");
const mongoDbConstant = require("../db/mongo/constant.mongo");
const mailUtil = require("../utils/mail.util");
const notificationQueueDb = require("../db/mongo/notificationQueue.db");
const dateUtil = require("../utils/date.util");
const organizationDb = require("../db/mongo/organization.db");


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

exports.sendIdealMail = async () => {
    const status = mongoDbConstant.notificationQueue.status.ideal;

    const organizationCredentialIds = await getImmediateOrgIds(status);
    if (organizationCredentialIds === null) return;

    for (const orgCredId of organizationCredentialIds) {
        const organizationCredentialDbRes = await organizationCredentialDb.findOne({
            _id: orgCredId,
            status: mongoDbConstant.organizationCredentials.status.active
        }).select({ emailUserName: 1, emailPassword: 1, notificationSendPercent: 1, emailRateLimit: 1 });

        if (organizationCredentialDbRes === null) return;
        let limit = (organizationCredentialDbRes.notificationSendPercent.imidiate / 100) *
            organizationCredentialDbRes.emailRateLimit;

        limit = limit ? limit : 0; //for safe

        const notificationQueueDbRes = await notificationQueueDb.find({
            organizationCredentialId: orgCredId,
            priority: mongoDbConstant.notificationQueue.priority.immediate,
            status: status
        }).select({ receiverEmailId: 1, subject: 1, text: 1 })
            .sort({ _id: 1 })
            .limit(limit); 

        if (notificationQueueDbRes === null || notificationQueueDbRes.length === 0) continue;

        notificationQueueDbRes.forEach(async (notification) => {
            const isIdeal = await notificationQueueDb.updateOne({ _id: notification.id, status: status }, {
                $set: {
                    status: mongoDbConstant.notificationQueue.status.processing,
                    lastAttemptTime:Date.now()
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

exports.sendAttemptMail = async () => {

    const status = mongoDbConstant.notificationQueue.status.attempt;

    const organizationCredentialIds = await getImmediateOrgIds(status);
    if (organizationCredentialIds === null) return;

    for (const orgCredId of organizationCredentialIds) {
        const organizationCredentialDbRes = await organizationCredentialDb.findOne({
            _id: orgCredId,
            status: mongoDbConstant.organizationCredentials.status.active
        }).select({ emailUserName: 1, emailPassword: 1, notificationSendPercent: 1, emailRateLimit: 1 });

        if (organizationCredentialDbRes === null) return;
        let limit = (organizationCredentialDbRes.notificationSendPercent.faild / 100) *
                organizationCredentialDbRes.emailRateLimit;

        limit = limit ? limit : 0; //for safe
        let beforeTime=new Date();
        beforeTime.setHours(beforeTime.getHours()-1);

        const notificationQueueDbRes = await notificationQueueDb.find({
            organizationCredentialId: orgCredId,
            priority: mongoDbConstant.notificationQueue.priority.immediate,
            lastAttemptTime:{$lte:beforeTime},
            status: status
        }).select({ receiverEmailId: 1, subject: 1, text: 1,lastAttemptTime:1 })
            .sort({ _id: 1 })
            .limit(limit); 

        if (notificationQueueDbRes === null || notificationQueueDbRes.length === 0) continue;

        notificationQueueDbRes.forEach(async (notification) => {
            const isIdeal = await notificationQueueDb.updateOne({ _id: notification.id, status: status }, {
                $set: {
                    status: mongoDbConstant.notificationQueue.status.processing,
                    lastAttemptTime:Date.now()
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

exports.updateStatus = async (id, status) => {
    await notificationQueueDb.updateOne({
        _id: id
    }, {
        $set: { status: status }
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
