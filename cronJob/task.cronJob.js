const { CronJob } = require("cron");
const notificationHistoryController = require("../controllers/notificationHistory.controller");
const queueController = require("../controllers/queue.controller");
const timeZone='Asia/Kolkata';

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

//send ideal mail 
CronJob.from({
    cronTime: '*/3 * * * * *',
    onTick: () => {
        queueController.sendIdealMail();
    },
    start: true,
    timeZone: timeZone
})

//send already attempt mail 
CronJob.from({
    cronTime: '*/3 * * * * *',
    onTick: () => {
        queueController.sendAttemptMail();
    },
    start: true,
    timeZone: timeZone
})
