const CustomError = require("../errors/customError");
const organizationCredentialDb = require("../db/mongo/organizationCredentials.mongo");
const organization = require("../db/mongo/organization.db");
const mongoDbConstant = require("../db/mongo/constant.mongo");
const responseUtil = require("../utils/response.util");
const mailUtil = require("../utils/mail.util");
const notificationQueueDb = require("../db/mongo/notificationQueue.db");
const notificationValidation = require("../validations/notification.validation");
const {Mongoose} = require("mongoose");

exports.sendImmediate = async (req, res) => {
    const validation = notificationValidation.sendImmediateBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const {organizationId, receiverEmailId, subject, text} = req.body;
    const organizationCredentialDbRes = await organizationCredentialDb
        .findOne({
            organizationId: organizationId,
            status: mongoDbConstant.organizationCredentials.status.active,
        })
        .select({emailUserName: 1, emailPassword: 1});

    if (organizationCredentialDbRes === null) {
        throw new CustomError({
            message: "organization not found or organization credential not set",
            statusCode: 404
        })
    }

    await notificationQueueDb.create({
        organizationId: organizationId,
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

//cron job function
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
            _id: "$organizationId"
        }
    };

    aggregationArray.push(matchPipeline);
    aggregationArray.push(groupPipeline);

    const notificationQueueDbRes=await notificationQueueDb.aggregate(aggregationArray).exec();
    if(notificationQueueDbRes.length===0)return null;
    return notificationQueueDbRes.map(item => item._id);
}

exports.sendImmediateMail = async () => {
    const status=mongoDbConstant.notificationQueue.status.ideal;

    const organizationIds=await getImmediateOrgIds(status);
    if(organizationIds===null)return;

    for (const orgId of organizationIds) {
        // const organizationDbRes=organizationDb
        const notificationQueueDbRes=await notificationQueueDb.find({
            organizationId:orgId,
            priority:mongoDbConstant.notificationQueue.priority.immediate,
            status:status,
        }).limit(10);

        if(notificationQueueDbRes===null) continue;

        notificationQueueDbRes.forEach((notification)=>{
            mailUtil.sendMail({
                // emailUserName:notification.,
                // emailPassword,
                receiverEmailId:notification.receiverEmailId,
                subject:notification.subject,
                text:notification.text
            })
        })


    }

}