const { CronJob } = require("cron");
const notificationHistoryController = require("../controllers/notificationHistory.controller");
const queueController = require("../controllers/queue.controller");
const timeZone='Asia/Kolkata';
const mongoDbConstant = require("../db/mongo/constant.mongo");

//clear success queue 
CronJob.from({
    cronTime: '*/15 * * * * *',
    onTick: () => {
        notificationHistoryController.saveSuccessNotificationFromQueue();
    },
    start: true,
    timeZone: timeZone
})

//clear multiple attempt (failed) queue 
CronJob.from({
    cronTime: '*/15 * * * * *',
    onTick: () => {
        notificationHistoryController.saveFailedNotificationFromQueue();
    },
    start: true,
    timeZone: timeZone
})

//send Immediate ideal mail 
CronJob.from({
    cronTime: '*/3 * * * * *',
    onTick: () => {
        queueController.sendIdealMail(mongoDbConstant.notificationQueue.priority.immediate);
    },
    start: true,
    timeZone: timeZone
})

//send Schedule ideal mail 
CronJob.from({
    cronTime: '*/5 * * * * *',
    onTick: () => {
        queueController.sendIdealMail(mongoDbConstant.notificationQueue.priority.schedule);
    },
    start: true,
    timeZone: timeZone
})

//send already attempt (error) mail 
CronJob.from({
    cronTime: '*/3 * * * * *',
    onTick: () => {
        queueController.sendErrorMail();
    },
    start: true,
    timeZone: timeZone
})
