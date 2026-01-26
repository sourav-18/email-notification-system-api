const { CronJob } = require("cron");
const notificationHistoryController = require("../controllers/notificationHistory.controller");
const queueController = require("../controllers/queue.controller");
const timeZone='Asia/Kolkata';

//clear queue 
CronJob.from({
    cronTime: '*/15 * * * * *',
    onTick: () => {
        notificationHistoryController.saveSuccessNotificationFromQueue();
    },
    start: true,
    timeZone: timeZone
})

//clear queue 
CronJob.from({
    cronTime: '*/15 * * * * *',
    onTick: () => {
        notificationHistoryController.saveFailedNotificationFromQueue();
    },
    start: true,
    timeZone: timeZone
})

CronJob.from({
    cronTime: '*/3 * * * * *',
    onTick: () => {
        queueController.sendIdealMail();
    },
    start: true,
    timeZone: timeZone
})

CronJob.from({
    cronTime: '*/3 * * * * *',
    onTick: () => {
        queueController.sendAttemptMail();
    },
    start: true,
    timeZone: timeZone
})
